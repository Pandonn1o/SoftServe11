const request = require('supertest');
const Article = require('../models/articleModel');
const dbHandler = require('./dbHandler');
const app = require('../app');

describe('DELETE', () => {
  beforeAll(async () => await dbHandler.connect());

  afterAll(async () => await dbHandler.closeDatabase());

  it('/api/v1/articles returns articles', async () => {
    const articleToDelete = await Article.findOne({
      title: 'The Forest Hiker',
    });

    const article2 = await Article.findOne({
      title: 'The Forest Hiker',
    });
    expect(article2).not.toBeNull();

    await request(app)
      .delete(`/api/v1/articles/${String(articleToDelete._id)}`)
      .set('Accept', 'application/json')
      .expect(204);

    const article = await Article.findById(String(articleToDelete._id));
    expect(article).toBeNull();
  });
});
