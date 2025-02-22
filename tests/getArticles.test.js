const request = require('supertest');
const dbHandler = require('./dbHandler');
const Article = require('../models/articleModel');
const app = require('../app');

describe('GET', () => {
  beforeAll(async () => await dbHandler.connect());

  afterAll(async () => await dbHandler.closeDatabase());

  it('/api/v1/articles returns articles', async () => {
    const response = await request(app)
      .get('/api/v1/articles')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.count).toEqual(7);
    expect(response.body.data.articles.length).toEqual(7);
    expect(
      response.body.data.articles.find(
        (article) => article.title === 'The Coastal Explorer'
      )
    )
      .toHaveProperty('_id')
      .toHaveProperty('comments')
      .toHaveProperty(
        'description',
        'Discover stunning coastal landscapes on a hiking adventure'
      )
      .toHaveProperty('dislikesQuantity', 1)
      .toHaveProperty('viewsCount', 4)
      .toHaveProperty('rating', 1)
      .toHaveProperty('likesQuantity', 1);
  });

  it(`/api/v1/articles?title=The+City+Mall returns one article 
  with expected properties`, async () => {
    const expectedQuantity = 1;

    const response = await request(app)
      .get('/api/v1/articles?title=The+City+Mall')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.count).toEqual(expectedQuantity);
    expect(response.body.data.articles.length).toEqual(expectedQuantity);
    expect(response.body.data.articles[0])
      .toHaveProperty('_id')
      .toHaveProperty('comments')
      .toHaveProperty(
        'description',
        'The best shopping center ever. Enjojed the service. Lorem ipsum'
      )
      .toHaveProperty('dislikesQuantity', 1)
      .toHaveProperty('viewsCount', 8)
      .toHaveProperty('title', 'The City Mall')
      .toHaveProperty('rating', 0.5)
      .toHaveProperty('likesQuantity', 0);
    // expect(response.body).toEqual({});
  });

  it('/api/v1/articles?viewsCount[gt]=3 returns two articles', async () => {
    const expectedQuantity = 2;

    const response = await request(app)
      .get('/api/v1/articles?viewsCount[gt]=3')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.count).toEqual(expectedQuantity);
    expect(response.body.data.articles.length).toEqual(expectedQuantity);
  });

  it(`/api/v1/articles?theme=trips returns four articles`, async () => {
    const expectedQuantity = 4;

    const response = await request(app)
      .get('/api/v1/articles?theme=trips')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.count).toEqual(expectedQuantity);
    expect(response.body.data.articles.length).toEqual(expectedQuantity);
  });

  it(`/api/v1/articles?theme=trips&viewsCount[gte]=1 returns two articles`, async () => {
    const expectedQuantity = 3;

    const response = await request(app)
      .get('/api/v1/articles?theme=trips&viewsCount[gte]=1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.count).toEqual(expectedQuantity);
    expect(response.body.data.articles.length).toEqual(expectedQuantity);
  });

  it(`/api/v1/articles?limit=2 returns two articles`, async () => {
    const expectedQuantity = 2;

    const response = await request(app)
      .get('/api/v1/articles?limit=2')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.count).toEqual(expectedQuantity);
    expect(response.body.data.articles.length).toEqual(expectedQuantity);
  });

  it(`/api/v1/articles?sort=title&limit=2 returns articles ordered alphabetically by title`, async () => {
    const expectedQuantity = 2;

    const response = await request(app)
      .get('/api/v1/articles?sort=title&limit=2')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.count).toEqual(expectedQuantity);
    expect(response.body.data.articles.length).toEqual(expectedQuantity);
    expect(response.body.data.articles[0].title).toEqual('The Art Museum');
    expect(response.body.data.articles[1].title).toEqual('The Beach Resort');
  });

  it(`/api/v1/articles?sort=theme,title returns articles 
  ordered alphabetically by theme and then by title`, async () => {
    const expectedQuantity = 7;

    const response = await request(app)
      .get('/api/v1/articles?sort=theme,title')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.count).toEqual(expectedQuantity);
    expect(response.body.data.articles.length).toEqual(expectedQuantity);
    expect(response.body.data.articles[0].title).toEqual('The Art Museum');
    expect(response.body.data.articles[1].title).toEqual(
      'The Fine Dining Experience'
    );
    expect(response.body.data.articles[3].title).toEqual('The Beach Resort');
    expect(response.body.data.articles[4].title).toEqual(
      'The Coastal Explorer'
    );
  });

  it(`/api/v1/articles?sort=title&limit=2&page=2 returns two articles 
  from page number 2 ordered alphabetically by title`, async () => {
    const expectedQuantity = 2;

    const response = await request(app)
      .get('/api/v1/articles?sort=title&limit=2&page=2')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.count).toEqual(expectedQuantity);
    expect(response.body.data.articles.length).toEqual(expectedQuantity);
    expect(response.body.data.articles[0].title).toEqual('The City Mall');
    expect(response.body.data.articles[1].title).toEqual(
      'The Coastal Explorer'
    );
  });

  it(`/api/v1/articles/{id} returns an article 
  with expected properties`, async () => {
    const articleToGet = await Article.findOne({
      title: 'The Forest Hiker',
    });

    const response = await request(app)
      .get(`/api/v1/articles/${String(articleToGet._id)}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toEqual('success');
    expect(response.body.data.article)
      .toHaveProperty('_id')
      .toHaveProperty('comments')
      .toHaveProperty(
        'description',
        'Breathtaking hike through the Canadian Banff National Park'
      )
      .toHaveProperty('dislikesQuantity', 0)
      .toHaveProperty('viewsCount', 3)
      .toHaveProperty('title', 'The Forest Hiker')
      .toHaveProperty('rating', 2)
      .toHaveProperty('likesQuantity', 1);
  });
});
