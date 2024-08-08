
const bcrypt=require('bcryptjs')
const User=require('../models/user/userModel')
const jwt=require('jsonwebtoken')

const userRegister = async (req,res)=>{
    try {
        const userExist = await User.findOne({email:req.body.email})
        if(userExist){
            return res.send({
                success:false,
                message:"User Already Existss!!"
            })
        }

        //hash the password

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        req.body.password=hashedPassword
        const newUser= new User(req.body)
        await newUser.save()

        res.send({
            success:true,
            message:"Registration Successfull!!"
        })
    } catch (error) {
        console.log(error)
    }
}

const loginUser =  async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'User does not exist' });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }
  
      // Create and send token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ success: true, message: 'Login successful', data: token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  const getCurrentUser =  async (req, res) => {
    try {
        console.log('Fetching user with ID:', req.userId); // Debugging: Log the userId being fetched
        const user = await User.findById(req.userId).select('-password');
        console.log('Fetched user:', user); // Debugging: Log the fetched user

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        res.send({
            success: true,
            message: "User details fetched successfully!",
            data: user
        });
    } catch (error) {
        console.error('Error fetching user:', error); // Debugging: Log the error if any
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
}

const updateUser =  async (req, res) => {
    console.log("this is "+req.user)
    const { name, email } = req.body;

    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ success: false, message: 'Email must end with @gmail.com' });
      }
  
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { name, email },
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.json({ success: true, data: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
module.exports={
    userRegister,
    loginUser,
    getCurrentUser,
    updateUser
}