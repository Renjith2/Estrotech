// controllers/blogController.js
const Blog = require('../models/blogs/blogModel');
const User=require('../models/user/userModel')

const addBlogPost = async (req, res) => {
  const { title, content } = req.body;
  const user = await User.findById(req.userId).select('-password');

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  try {
    const newPost = new Blog({
      title,
      content,
      author: user.name,
    });

    const savedPost = await newPost.save();
    res.status(201).json({ success: true, data: savedPost });
  } catch (error) {
    console.error('Error adding blog post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllBlogPosts = async (req, res) => {
    try {
      const blogs = await Blog.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: blogs });
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  const getBlogbyId=  async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
      res.json({ success: true, data: blog });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  

module.exports = {
  addBlogPost,
  getAllBlogPosts,
  getBlogbyId
};
