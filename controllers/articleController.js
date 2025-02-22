const Article = require('../models/articleModel');

const buildQuery = (req) => {
  const query = {};

  const filterFields = ['title', 'theme', 'description', 'viewsCount', 'lastChangedAt'];
  filterFields.forEach((field) => {
    if (req.query[field]) {
      query[field] = req.query[field];
    }
    if (req.query[`${field}[gt]`]) {
      query[field] = { $gt: req.query[`${field}[gt]`] };
    }
    if (req.query[`${field}[gte]`]) {
      query[field] = { $gte: req.query[`${field}[gte]`] };
    }
    if (req.query[`${field}[lt]`]) {
      query[field] = { $lt: req.query[`${field}[lt]`] };
    }
    if (req.query[`${field}[lte]`]) {
      query[field] = { $lte: req.query[`${field}[lte]`] };
    }
  });

  return query;
};

exports.getAllArticles = async (req, res) => {
  try {
    const query = buildQuery(req);

    let sort = req.query.sort || '-lastChangedAt';
    sort = sort.split(',').join(' ');

    let fields = req.query.fields || '-__v';
    fields = fields.split(',').join(' ');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const articles = await Article.find(query)
      .sort(sort)
      .select(fields)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      count: articles.length,
      data: {
        articles,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        status: 'fail',
        message: 'Article not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        article,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.postArticle = async (req, res) => {
  try {
    const newArticle = await Article.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        article: newArticle,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((el) => el.message);
      return res.status(400).json({ status: 'fail', message: errors.join('. ') });
    }
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.patchArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!article) {
      return res.status(404).json({
        status: 'fail',
        message: 'Article not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        article,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        status: 'fail',
        message: 'Article not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.viewsCountByTheme = async (req, res) => {
  try {
    const viewsByTheme = await Article.aggregate([
      {
        $group: {
          _id: '$theme',
          views: { $sum: '$viewsCount' },
        },
      },
      {
        $sort: { views: -1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        count: viewsByTheme.length,
        result: viewsByTheme,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.threeMostLiked = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;

    const mostLiked = await Article.aggregate([
      {
        $unwind: '$comments',
      },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          commentsCount: { $sum: 1 },
          likes: {
            $sum: {
              $cond: {
                if: { $eq: ['$comments.evaluation', 'like'] },
                then: 1,
                else: 0,
              },
            },
          },
          dislikes: {
            $sum: {
              $cond: {
                if: { $eq: ['$comments.evaluation', 'dislike'] },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          commentsCount: 1,
          rating: {
            $divide: [{ $subtract: ['$likes', '$dislikes'] }, '$commentsCount'],
          },
        },
      },
      {
        $sort: { rating: -1, title: 1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          title: 1,
          commentsCount: 1,
          rating: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        count: mostLiked.length,
        result: mostLiked,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};