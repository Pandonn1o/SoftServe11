const request = require('supertest');
const Article = require('../models/articleModel');
const dbHandler = require('./dbHandler');
const app = require('../app');

describe('POST', () => {
  beforeAll(async () => await dbHandler.connect());
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // afterEach(async () => await dbHandler.clearDatabase());
  afterAll(async () => await dbHandler.closeDatabase());

  const checkArticle = (createdArticle) => {
    expect(createdArticle)
      .toHaveProperty(['comments', 0, 'evaluation'], 'like')
      .toHaveProperty(
        ['comments', 0, 'content'],
        'Had a blast! The zip lines were my favorite'
      )
      .toHaveProperty('comments.length', 3)
      .toHaveProperty(
        'description',
        'Exciting and challenging obstacle course in the woods'
      )
      .toHaveProperty('dislikesQuantity', 1)
      .toHaveProperty('viewsCount', 5)
      .toHaveProperty('rating', 1.3333333333333333)
      .toHaveProperty('likesQuantity', 2);
  };

  it('/api/v1/articles creates an article and returns it in the response', async () => {
    const response = await request(app)
      .post(`/api/v1/articles`)
      .send({
        title: 'The Adventure Park',
        theme: 'trips',
        description: 'Exciting and challenging obstacle course in the woods',
        viewsCount: 5,
        comments: [
          {
            evaluation: 'like',
            content: 'Had a blast! The zip lines were my favorite',
            lastChangedAt: '2022-06-10,11:45',
          },
          {
            evaluation: 'like',
            content: 'Highly recommend for families and groups of friends',
            lastChangedAt: '2022-07-03,14:00',
          },
          {
            evaluation: 'dislike',
            content: 'Not suitable for beginners, too difficult and dangerous',
            lastChangedAt: '2022-08-01,09:20',
          },
        ],
      })
      .set('Accept', 'application/json')
      .expect(201);

    const createdArticle = await Article.findOne({
      title: 'The Adventure Park',
    });

    checkArticle(createdArticle);
    checkArticle(response.body.data.article);
  });
});
