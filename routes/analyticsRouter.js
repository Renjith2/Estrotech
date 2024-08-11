const { analyticsController } = require('../controller/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');
const router=require('express').Router()




router.get('/:date',authMiddleware, analyticsController);

module.exports=router