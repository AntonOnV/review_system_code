import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [reviewText, setReviewText] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState('');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchRecommendations();
    fetchReviews();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/recommendations');
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText || !restaurantId) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/reviews', {
        text: reviewText,
        restaurant_id: restaurantId
      });
      setMessage(`Review added! Sentiment: ${response.data.sentiment}`);
      setReviewText('');
      setRestaurantId('');
      fetchRecommendations();
      fetchReviews();
    } catch (error) {
      setMessage('Error while submitting the review');
      console.error(error);
    }
  };

  const total = reviews.length;
  const positives = reviews.filter(r => r.sentiment === 'positive').length;
  const positiveRatio = total > 0 ? (positives / total * 100).toFixed(2) : 0;

  const renderStars = (percent) => {
    const stars = Math.round((percent / 100) * 5);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  return (
    <div className="container">
      <h1 className="title">Restaurant Review Recommendation System</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Restaurant name (ID):</label>
          <input
            type="text"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            placeholder="e.g., restaurant_1"
          />
        </div>
        <div className="form-group">
          <label>Review:</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Enter your review"
          ></textarea>
        </div>
        <button type="submit">Submit review</button>
      </form>
      {message && <p className="message">{message}</p>}

      <h2 className="section-title">⭐ Recommended Restaurants</h2>
      <ul className="recommendation-list">
        {recommendations.map((rec, index) => (
          <li key={index}>
            <div><strong>{rec.restaurant_id}</strong></div>
            <div>Rating: {renderStars(rec.positive_ratio * 100)} ({(rec.positive_ratio * 100).toFixed(1)}%)</div>
          </li>
        ))}
      </ul>

      <h2 className="section-title">📊 Overall positivity %</h2>
      <p className="summary">Average percentage of positive reviews: <strong>{positiveRatio}%</strong></p>

      <h2 className="section-title">📜 Review History</h2>
      <div className="history-block">
        {reviews.map((review, idx) => (
          <div key={idx} className="review-card">
            <strong>{review.restaurant_id}</strong><br />
            {review.text}<br />
            Sentiment: <b className={`sentiment-${review.sentiment}`}>
              {review.sentiment}
            </b>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
