import { useState } from 'react';
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
  Progress,
  Separator,
  Table,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import {
  BarChartIcon,
  ChatBubbleIcon,
  CheckCircledIcon,
  DashboardIcon,
  ExclamationTriangleIcon,
  ExitIcon,
  PaperPlaneIcon,
  ReaderIcon,
  StarFilledIcon,
  StarIcon,
} from '@radix-ui/react-icons';
import LanguageSelector from './LanguageSelector';

const sentimentColors = {
  positive: 'green',
  negative: 'red',
  neutral: 'gray',
};

function SectionHeading({ icon, title, description }) {
  return (
    <Flex align="start" gap="3">
      <Flex className="section-icon" align="center" justify="center">{icon}</Flex>
      <Box>
        <Heading as="h2" size="5">{title}</Heading>
        {description && <Text as="p" size="2" color="gray">{description}</Text>}
      </Box>
    </Flex>
  );
}

function Rating({ percent }) {
  const { t } = useTranslation();
  const filledStars = Math.round((percent / 100) * 5);

  return (
    <Flex align="center" gap="1" aria-label={t('recommendations.ratingLabel', { percent: percent.toFixed(1) })}>
      {Array.from({ length: 5 }, (_, index) => (
        index < filledStars
          ? <StarFilledIcon key={index} className="star star--filled" />
          : <StarIcon key={index} className="star" />
      ))}
    </Flex>
  );
}

function AuthenticatedApp({
  reviews,
  recommendations,
  reviewText,
  restaurantId,
  message,
  onReviewTextChange,
  onRestaurantIdChange,
  onSubmit,
  onLogout,
}) {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState('overview');
  const total = reviews.length;
  const positives = reviews.filter((review) => review.sentiment === 'positive').length;
  const negatives = reviews.filter((review) => review.sentiment === 'negative').length;
  const positiveRatio = total > 0 ? Number(((positives / total) * 100).toFixed(1)) : 0;

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <Flex align="center" gap="3">
          <Flex className="sidebar-brand-mark" align="center" justify="center"><UtensilsCrossed size={19} strokeWidth={2} /></Flex>
          <Box>
            <Text as="div" size="1" weight="bold" color="indigo" className="eyebrow">{t('brand.eyebrow')}</Text>
            <Text weight="bold">{t('brand.title')}</Text>
          </Box>
        </Flex>

        <Flex className="sidebar-nav" direction="column" gap="2">
          <Button
            variant={activePage === 'overview' ? 'solid' : 'soft'}
            color={activePage === 'overview' ? 'indigo' : 'gray'}
            onClick={() => setActivePage('overview')}
          >
            <DashboardIcon /> {t('navigation.overview')}
          </Button>
          <Button
            variant={activePage === 'reviews' ? 'solid' : 'soft'}
            color={activePage === 'reviews' ? 'indigo' : 'gray'}
            onClick={() => setActivePage('reviews')}
          >
            <ReaderIcon /> {t('navigation.reviews')}
          </Button>
        </Flex>

        <Flex className="sidebar-footer" direction="column" gap="2">
          <LanguageSelector />
          <Button variant="soft" color="red" onClick={onLogout}><ExitIcon /> {t('actions.logout')}</Button>
        </Flex>
      </aside>

      <section className="dashboard-content">
        <Container size="4">
          <Flex direction="column" gap="6">
            <Box>
              <Text as="div" size="2" color="gray">{t('brand.title')}</Text>
              <Heading as="h1" size="7">{t(`navigation.${activePage}`)}</Heading>
            </Box>

            {activePage === 'overview' ? (
              <>
                <Card size="4">
                  <Flex direction="column" gap="5">
                    <SectionHeading icon={<PaperPlaneIcon />} title={t('reviewForm.title')} description={t('reviewForm.description')} />
                    <form onSubmit={onSubmit}>
                      <Flex direction="column" gap="4">
                        <Box>
                          <Text as="label" size="2" weight="medium" mb="2">{t('reviewForm.restaurantId')}</Text>
                          <TextField.Root size="3" value={restaurantId} onChange={(event) => onRestaurantIdChange(event.target.value)} placeholder={t('reviewForm.restaurantPlaceholder')} />
                        </Box>
                        <Box>
                          <Text as="label" size="2" weight="medium" mb="2">{t('reviewForm.review')}</Text>
                          <TextArea size="3" value={reviewText} onChange={(event) => onReviewTextChange(event.target.value)} placeholder={t('reviewForm.reviewPlaceholder')} resize="vertical" />
                        </Box>
                        <Button type="submit" size="3" className="submit-button"><PaperPlaneIcon /> {t('actions.submit')}</Button>
                      </Flex>
                    </form>
                    {message && (
                      <Callout.Root color={message.error ? 'red' : 'green'} size="1">
                        <Callout.Icon>{message.error ? <ExclamationTriangleIcon /> : <CheckCircledIcon />}</Callout.Icon>
                        <Callout.Text>{t(message.key, message.options)}</Callout.Text>
                      </Callout.Root>
                    )}
                  </Flex>
                </Card>

                <div className="overview-grid">
                  <Card size="4">
                    <Flex direction="column" gap="4">
                      <SectionHeading icon={<StarFilledIcon />} title={t('recommendations.title')} description={t('recommendations.description')} />
                      <Separator size="4" />
                      {recommendations.length ? recommendations.map((recommendation, index) => {
                        const percent = recommendation.positive_ratio * 100;
                        return (
                          <Flex key={recommendation.restaurant_id || index} align="center" justify="between" gap="4">
                            <Flex align="center" gap="3">
                              <Badge color="indigo" variant="soft" radius="full">{index + 1}</Badge>
                              <Box>
                                <Text as="div" weight="bold">{recommendation.restaurant_id}</Text>
                                <Rating percent={percent} />
                              </Box>
                            </Flex>
                            <Text size="2" weight="bold" color="indigo">{percent.toFixed(1)}%</Text>
                          </Flex>
                        );
                      }) : <Text color="gray" size="2">{t('recommendations.empty')}</Text>}
                    </Flex>
                  </Card>

                  <Card size="4">
                    <Flex direction="column" gap="4">
                      <SectionHeading icon={<BarChartIcon />} title={t('stats.title')} />
                      <Box>
                        <Flex align="end" gap="2" mb="3">
                          <Heading size="8">{positiveRatio}%</Heading>
                          <Text color="gray" mb="1">{t('stats.positive')}</Text>
                        </Flex>
                        <Progress value={positiveRatio} size="3" />
                      </Box>
                      <Flex gap="2" wrap="wrap">
                        <Badge color="green" size="2">{t('stats.positiveCount', { count: positives })}</Badge>
                        <Badge color="red" size="2">{t('stats.negativeCount', { count: negatives })}</Badge>
                        <Badge color="gray" size="2">{t('stats.totalCount', { count: total })}</Badge>
                      </Flex>
                    </Flex>
                  </Card>
                </div>
              </>
            ) : (
              <Card size="4">
                <Flex direction="column" gap="4">
                  <SectionHeading icon={<ChatBubbleIcon />} title={t('history.title')} description={t('history.description', { count: total })} />
                  <Separator size="4" />
                  <div className="table-scroll">
                    <Table.Root variant="surface">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell>{t('history.restaurant')}</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>{t('history.review')}</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>{t('history.sentiment')}</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {reviews.length ? reviews.map((review) => (
                          <Table.Row key={review._id}>
                            <Table.RowHeaderCell>{review.restaurant_id}</Table.RowHeaderCell>
                            <Table.Cell><Text color="gray" size="2">{review.text}</Text></Table.Cell>
                            <Table.Cell>
                              <Badge color={sentimentColors[review.sentiment] || 'gray'} variant="soft">{t(`sentiment.${review.sentiment}`)}</Badge>
                            </Table.Cell>
                          </Table.Row>
                        )) : (
                          <Table.Row>
                            <Table.Cell colSpan={3}>
                              <Flex className="empty-state" direction="column" align="center" gap="2">
                                <ChatBubbleIcon width="24" height="24" />
                                <Text weight="medium">{t('history.emptyTitle')}</Text>
                                <Text color="gray" size="2">{t('history.emptyDescription')}</Text>
                              </Flex>
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </Table.Body>
                    </Table.Root>
                  </div>
                </Flex>
              </Card>
            )}
          </Flex>
        </Container>
      </section>
    </main>
  );
}

export default AuthenticatedApp;
