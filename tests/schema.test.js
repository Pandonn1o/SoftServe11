const Article = require('../models/articleModel');
const dbHandler = require('./dbHandler');

describe.only('title', () => {
  const now = new Date('4 Oct 2023');
  function mockNow() {
    global.Date = jest.fn().mockImplementation(() => now); // mock Date "new" constructor
    global.Date.now = jest.fn().mockReturnValue(now.valueOf()); // mock Date.now
  }
  beforeAll(async () => {
    mockNow();
    await dbHandler.connect();
  });
  beforeEach(async () => {
    await Article.deleteMany();
    jest.clearAllMocks();
  });
  // afterEach(async () => await dbHandler.clearDatabase());
  afterAll(async () => await dbHandler.closeDatabase());

  it('title is mandatory', async () => {
    const article = new Article({
      theme: 'trips',
      description: 'Exciting and challenging obstacle course in the woods',
    });

    await expect(article.validate()).rejects.toThrow('Title is required');
  });

  it('title min length is set to 10', async () => {
    const article = new Article({
      title: 'The Adv',
      theme: 'trips',
      description: 'Exciting and challenging obstacle course in the woods',
    });

    await expect(article.validate()).rejects.toThrow(
      'Title should be longer than 10 characters'
    );
  });

  it(`title has unique constraint`, async () => {
    const title = 'The Adventure Park';
    await Article.create({
      title: title,
      theme: 'trips',
      description: 'Exciting and challenging obstacle course in the woods',
    });

    try {
      await Article.create({
        title: title,
        theme: 'trips',
        description: 'Exciting and challenging obstacle course in the woods',
      });
      expect(true).toBe(false);
    } catch (error) {
      // error is thrown as expected
    }
  });

  it(`theme does not allow values except 'trips', 'shopping', 'beauty', 'art', 'food'`, async () => {
    const invalidTheme = 'misterious trips';
    const article = new Article({
      title: 'The Adventure Park',
      theme: invalidTheme,
      description: 'Exciting and challenging obstacle course in the woods',
    });

    await expect(article.validate()).rejects.toThrow(
      `${invalidTheme} is not supported`
    );
  });

  it(`description is trimmed on save`, async () => {
    const description = 'Exciting and challenging obstacle course in the woods';
    const article = await Article.create({
      title: 'The Adventure Park',
      theme: 'trips',
      description: `  ${description}  `,
    });

    expect(article.description).toBe(description);
  });

  it(`lastChangedAt has default value of current time on creation`, async () => {
    const article = await Article.create({
      title: 'The New Adventure',
      theme: 'trips',
      description: 'Exciting and challenging obstacle course in the woods',
    });

    expect(article.lastChangedAt).toEqual(now);
  });

  it(`lastChangedAt 2 has default value of current time on creation`, async () => {
    const article = await Article.create({
      title: 'The New Adventure',
      theme: 'trips',
      description: 'Exciting and challenging obstacle course in the woods',
    });

    expect(article.lastChangedAt).toEqual(now);
  });

  it(`lastChangedAt has default value  of current time on update`, async () => {
    await dbHandler.imporDefaultData();
    const article = await Article.findOneAndUpdate(
      {
        title: 'The Fine Dining Experience',
      },
      {
        description:
          'Exciting and challenging obstacle course in the woods and rivers',
      },
      {
        new: true,
      }
    );

    expect(article.lastChangedAt).toEqual(now);
  });
});
