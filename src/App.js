import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UtensilsCrossed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Container,
  Flex,
  Heading,
  Text,
  TextField,
  Theme,
} from '@radix-ui/themes';
import {
  CheckCircledIcon,
  EnvelopeClosedIcon,
  EnterIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  PersonIcon,
  PlusCircledIcon,
} from '@radix-ui/react-icons';
import '@radix-ui/themes/styles.css';
import AuthenticatedApp from './components/AuthenticatedApp';
import LanguageSelector from './components/LanguageSelector';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const { t } = useTranslation();
  const [reviewText, setReviewText] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState(null);

  useEffect(() => {
    fetchRecommendations();
    fetchReviews();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/recommendations`);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!reviewText || !restaurantId) {
      setMessage({ key: 'reviewForm.required', error: true });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/reviews`, {
        text: reviewText,
        restaurant_id: restaurantId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({
        key: 'reviewForm.submitted',
        options: { sentiment: response.data.sentiment },
        error: false,
      });
      setReviewText('');
      setRestaurantId('');
      fetchRecommendations();
      fetchReviews();
    } catch (error) {
      setMessage({ key: 'reviewForm.failed', error: true });
      console.error(error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/login`, { email, password });
      localStorage.setItem('token', response.data.access_token);
      setToken(response.data.access_token);
      setAuthMessage(null);
    } catch (error) {
      setAuthMessage({ key: 'auth.loginFailed', error: true });
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/api/register`, { email, password });
      setAuthMessage({ key: 'auth.registered', error: false });
    } catch (error) {
      setAuthMessage({ key: 'auth.registrationFailed', error: true });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setMessage(null);
  };

  return (
    <Theme accentColor="indigo" grayColor="slate" radius="large" scaling="100%">
      {token ? (
        <AuthenticatedApp
          reviews={reviews}
          recommendations={recommendations}
          reviewText={reviewText}
          restaurantId={restaurantId}
          message={message}
          onReviewTextChange={setReviewText}
          onRestaurantIdChange={setRestaurantId}
          onSubmit={handleSubmit}
          onLogout={handleLogout}
        />
      ) : (
        <main className="app-shell">
          <Container size="3" px="4">
            <Flex className="app-header" align="center" gap="3">
              <Flex className="brand-mark" align="center" justify="center">
                <UtensilsCrossed size={22} strokeWidth={2} />
              </Flex>
              <Box>
                <Text as="div" size="1" weight="bold" color="indigo" className="eyebrow">
                  {t('brand.eyebrow')}
                </Text>
                <Heading as="h1" size={{ initial: '6', sm: '7' }}>{t('brand.title')}</Heading>
              </Box>
            </Flex>

            <Card size="4" className="auth-card">
              <Flex direction="column" gap="5">
                <Box>
                  <Badge color="indigo" variant="soft" mb="3">
                    <PersonIcon /> {t('auth.badge')}
                  </Badge>
                  <Heading as="h2" size="6">{t('auth.title')}</Heading>
                  <Text as="p" color="gray" mt="2">{t('auth.description')}</Text>
                </Box>

                <Flex direction="column" gap="3">
                  <TextField.Root size="3" type="email" placeholder={t('auth.email')} value={email} onChange={(event) => setEmail(event.target.value)}>
                    <TextField.Slot><EnvelopeClosedIcon /></TextField.Slot>
                  </TextField.Root>
                  <TextField.Root size="3" type="password" placeholder={t('auth.password')} value={password} onChange={(event) => setPassword(event.target.value)}>
                    <TextField.Slot><LockClosedIcon /></TextField.Slot>
                  </TextField.Root>
                </Flex>

                <Flex gap="3" wrap="wrap">
                  <Button size="3" onClick={handleLogin}><EnterIcon /> {t('auth.login')}</Button>
                  <Button size="3" variant="soft" onClick={handleRegister}><PlusCircledIcon /> {t('auth.register')}</Button>
                </Flex>

                {authMessage && (
                  <Callout.Root color={authMessage.error ? 'red' : 'green'} size="1">
                    <Callout.Icon>{authMessage.error ? <ExclamationTriangleIcon /> : <CheckCircledIcon />}</Callout.Icon>
                    <Callout.Text>{t(authMessage.key)}</Callout.Text>
                  </Callout.Root>
                )}
                <Flex justify="end"><LanguageSelector /></Flex>
              </Flex>
            </Card>
          </Container>
        </main>
      )}
    </Theme>
  );
}

export default App;
