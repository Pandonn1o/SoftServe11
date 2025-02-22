const express = require('express');
const articleController = require('../controllers/articleController');

const router = express.Router();

router.route('/views-by-theme').get(articleController.viewsCountByTheme);
router.route('/most-liked').get(articleController.threeMostLiked);

router
  .route('/')
  .get(articleController.getAllArticles)
  .post(articleController.postArticle);

router
  .route('/:id')
  .get(articleController.getArticle)
  .patch(articleController.patchArticle)
  .delete(articleController.deleteArticle);

module.exports = router;