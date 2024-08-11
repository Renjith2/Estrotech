const { uptimereport } = require("../controller/uptimeController");
const authMiddleware = require('../middlewares/authMiddleware');
const router=require('express').Router()


router.get('/list',authMiddleware, uptimereport)


module.exports=router