const { overallreportController } = require("../controller/overallreportController");
const router=require('express').Router()



router.get('/list', overallreportController);
module.exports=router;
