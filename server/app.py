from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from textblob import TextBlob
import datetime

app = Flask(__name__)
CORS(app)

# JWT конфігурація
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # змінити на щось надійне
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)
jwt = JWTManager(app)

# Підключення до MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['review_system']
reviews_collection = db['reviews']
users_collection = db['users']

# Аналіз тональності

def analyze_sentiment(text):
    analysis = TextBlob(text)
    polarity = analysis.sentiment.polarity
    if polarity > 0.1:
        return 'positive'
    elif polarity < -0.1:
        return 'negative'
    else:
        return 'neutral'

# Реєстрація
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'User already exists'}), 409
    hashed = generate_password_hash(password)
    users_collection.insert_one({'email': email, 'password': hashed})
    return jsonify({'message': 'User registered successfully'})

# Логін
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = users_collection.find_one({'email': email})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    access_token = create_access_token(identity=email)
    return jsonify({'access_token': access_token})

# Додавання відгуку (з авторизацією)
@app.route('/api/reviews', methods=['POST'])
@jwt_required()
def add_review():
    current_user = get_jwt_identity()
    data = request.get_json()
    review_text = data.get('text')
    restaurant_id = data.get('restaurant_id')
    if not review_text or not restaurant_id:
        return jsonify({'error': 'Missing review text or restaurant_id'}), 400
    sentiment = analyze_sentiment(review_text)
    review = {
        'restaurant_id': restaurant_id,
        'text': review_text,
        'sentiment': sentiment,
        'user': current_user
    }
    result = reviews_collection.insert_one(review)
    return jsonify({'id': str(result.inserted_id), 'sentiment': sentiment}), 201

# Отримання всіх відгуків
@app.route('/api/reviews', methods=['GET'])
def get_all_reviews():
    reviews = list(reviews_collection.find().sort('_id', -1))
    for r in reviews:
        r['_id'] = str(r['_id'])
    return jsonify(reviews)

# Рекомендації
@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    pipeline = [
        {'$group': {
            '_id': '$restaurant_id',
            'positive_count': {'$sum': {'$cond': [{'$eq': ['$sentiment', 'positive']}, 1, 0]}},
            'total_count': {'$sum': 1}
        }},
        {'$match': {'positive_count': {'$gte': 1}}},
        {'$project': {
            'restaurant_id': '$_id',
            'positive_ratio': {'$divide': ['$positive_count', '$total_count']},
            '_id': 0
        }},
        {'$sort': {'positive_ratio': -1}},
        {'$limit': 5}
    ]
    return jsonify(list(reviews_collection.aggregate(pipeline)))

# Статистика
@app.route('/api/stats', methods=['GET'])
def get_stats():
    reviews = list(reviews_collection.find())
    total = len(reviews)
    positives = sum(1 for r in reviews if r['sentiment'] == 'positive')
    negatives = sum(1 for r in reviews if r['sentiment'] == 'negative')
    average = (positives / total * 100) if total > 0 else 0
    return jsonify({'average': average, 'positive': positives, 'negative': negatives})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
