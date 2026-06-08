// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [reviewText, setReviewText] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

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
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });
      localStorage.setItem('token', response.data.access_token);
      setToken(response.data.access_token);
      setAuthMessage('Login successful!');
    } catch (error) {
      setAuthMessage('Login failed.');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        email,
        password
      });
      setAuthMessage('Registration successful! Now you can log in.');
    } catch (error) {
      setAuthMessage('Registration failed.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  const total = reviews.length;
  const positives = reviews.filter(r => r.sentiment === 'positive').length;
  const negatives = reviews.filter(r => r.sentiment === 'negative').length;
  const positiveRatio = total > 0 ? (positives / total * 100).toFixed(2) : 0;

  const renderStars = (percent) => {
    const stars = Math.round((percent / 100) * 5);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  return (
    <div className="container">
      <div className="header-with-logout">
        <h1>Restaurant Review Recommendation System</h1>
        {token && (
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        )}
      </div>

      {!token && (
        <div className="auth-block">
          <h2>Login / Register</h2>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
          {authMessage && <p>{authMessage}</p>}
        </div>
      )}

      {token && (
        <>
          <form onSubmit={handleSubmit} className="form">
            <div>
              <label>Restaurant ID:</label>
              <input type="text" value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} placeholder="e.g., restaurant_1" />
            </div>
            <div>
              <label>Review:</label>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Enter your review"></textarea>
            </div>
            <button type="submit">Submit Review</button>
          </form>

          {message && <p>{message}</p>}

          <h2>⭐ Recommended Restaurants</h2>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>
                <strong>{rec.restaurant_id}</strong> — Rating: {renderStars(rec.positive_ratio * 100)} ({(rec.positive_ratio * 100).toFixed(1)}%)
              </li>
            ))}
          </ul>

          <h2>📊 Overall Positivity</h2>
          <p><strong>{positiveRatio}%</strong> positive reviews ({positives} positive / {negatives} negative)</p>

          <h2>📜 Review History</h2>
          <div className="history-block">
            {reviews.map((review, idx) => (
              <div key={idx} className="review-card">
                <strong>{review.restaurant_id}</strong><br />
                {review.text}<br />
                Sentiment: <b className={`sentiment-${review.sentiment}`}>{review.sentiment}</b>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
