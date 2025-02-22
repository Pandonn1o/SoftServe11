const request = require('supertest');
const Article = require('../models/articleModel');
const dbHandler = require('./dbHandler');
const app = require('../app');

describe('PATCH', () => {
  beforeAll(async () => await dbHandler.connect());
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // afterEach(async () => await dbHandler.clearDatabase());
  afterAll(async () => await dbHandler.closeDatabase());

  it('/api/v1/articles returns articles', async () => {
    const articleToUpdate = await Article.findOne({
      title: 'The Forest Hiker',
    });

    const response = await request(app)
      .patch(`/api/v1/articles/${String(articleToUpdate._id)}`)
      .send({
        description: 'Exciting and challenging obstacle course in the woods',
        viewsCount: 5,
      })
      .set('Accept', 'application/json')
      .expect(200);

    const article = await Article.findById(String(articleToUpdate._id));
    expect(article)
      .toHaveProperty(['comments', 0, 'evaluation'], 'like')
      .toHaveProperty(
        ['comments', 0, 'content'],
        'Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et'
      )
      .toHaveProperty(
        'description',
        'Exciting and challenging obstacle course in the woods'
      )
      .toHaveProperty('dislikesQuantity', 0)
      .toHaveProperty('viewsCount', 5)
      .toHaveProperty('title', 'The Forest Hiker')
      .toHaveProperty('rating', 2)
      .toHaveProperty('likesQuantity', 1);

    expect(JSON.stringify(response.body.data.article)).toEqual(
      JSON.stringify(article)
    );
  });
});
