const { analyticsController } = require('../controller/analyticsController');
const router=require('express').Router()




router.get('/:date', analyticsController);

module.exports=router