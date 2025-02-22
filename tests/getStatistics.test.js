const request = require('supertest');
const dbHandler = require('./dbHandler');
const app = require('../app');

describe('GET', () => {
  beforeAll(async () => await dbHandler.connect());

  afterAll(async () => await dbHandler.closeDatabase());

  it('/api/v1/articles/most-liked returns three most liked articles', async () => {
    const response = await request(app)
      .get('/api/v1/articles/most-liked?limit=2')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.count).toEqual(2);
    expect(response.body.data.result.length).toEqual(2);
    expect(response.body.data.result).toEqual([
      { commentsCount: 1, rating: 1, title: 'The Forest Hiker' },
      { commentsCount: 3, rating: 0.3333333333333333, title: 'The Art Museum' },
    ]);
  });

  it('/api/v1/articles/views-by-theme returns three most liked articles', async () => {
    const response = await request(app)
      .get('/api/v1/articles/views-by-theme')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.count).toEqual(4);
    expect(response.body.data.result.length).toEqual(4);

    expect(response.body.data.result).toEqual([
      { _id: 'trips', views: 9 },
      { _id: 'shopping', views: 8 },
      { _id: 'art', views: 2 },
      { _id: 'food', views: 1 },
    ]);
  });
});
