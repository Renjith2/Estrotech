const router=require('express').Router()

const { loginUser, getCurrentUser, updateUser } = require('../controller/userController');
const { userRegister } = require('../controller/userController');



// register a User

router.post('/register',userRegister)


router.post('/login',loginUser);

module.exports=router