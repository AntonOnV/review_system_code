from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from textblob import TextBlob
from bson import ObjectId

# Flask app
app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['review_system']
reviews_collection = db['reviews']

# Sentiment analysis function using TextBlob
def analyze_sentiment(text):
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    if polarity > 0.1:
        return 'positive'
    elif polarity < -0.1:
        return 'negative'
    else:
        return 'neutral'

# GET all reviews
@app.route('/api/reviews', methods=['GET'])
def get_all_reviews():
    reviews = list(reviews_collection.find().sort('_id', -1))
    for r in reviews:
        r['_id'] = str(r['_id'])
    return jsonify(reviews)

# POST add a review
@app.route('/api/reviews', methods=['POST'])
def add_review():
    data = request.get_json()
    review_text = data.get('text')
    restaurant_id = data.get('restaurant_id')

    if not review_text or not restaurant_id:
        return jsonify({'error': 'Missing review text or restaurant_id'}), 400

    sentiment = analyze_sentiment(review_text)

    review = {
        'restaurant_id': restaurant_id,
        'text': review_text,
        'sentiment': sentiment
    }
    result = reviews_collection.insert_one(review)

    return jsonify({
        'id': str(result.inserted_id),
        'text': review_text,
        'sentiment': sentiment
    }), 201

# GET recommendations
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
    recommendations = list(reviews_collection.aggregate(pipeline))
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
