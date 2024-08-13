const { uptimereport } = require("../controller/uptimeController");
const router=require('express').Router()


router.get('/list', uptimereport)


module.exports=router