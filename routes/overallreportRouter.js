const { overallreportController } = require("../controller/overallreportController");
const router=require('express').Router()



router.get('/list',authMiddleware, overallreportController);
module.exports=router;