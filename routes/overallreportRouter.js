const { overallreportController } = require("../controller/overallreportController");
const authMiddleware = require('../middlewares/authMiddleware');
const router=require('express').Router()



router.get('/list',authMiddleware, overallreportController);
module.exports=router;