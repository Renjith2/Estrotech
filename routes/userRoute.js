const router=require('express').Router()

const { loginUser, getCurrentUser, updateUser } = require('../controller/userController');
const { userRegister } = require('../controller/userController');
const authMiddleware = require('../middlewares/authMiddleware')


// register a User

router.post('/register',userRegister)


router.post('/login',loginUser);


router.get('/get-current-user', authMiddleware,getCurrentUser);

router.put('/update', authMiddleware,updateUser);

module.exports=router