// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const { addBlogPost, getAllBlogPosts, getBlogbyId } = require('../controller/blogController');
const authMiddleware = require('../middlewares/authMiddleware');



router.post('/add', authMiddleware, addBlogPost);
router.get('/show', authMiddleware ,getAllBlogPosts);
router.get('/show/:id', authMiddleware ,getBlogbyId);

module.exports = router;
