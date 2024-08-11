const bcrypt = require('bcryptjs');
const User = require('../models/user/userModel');
const jwt = require('jsonwebtoken');
const { validateEmail, validateName, validatePassword } = require('../validation/Validation');


const userRegister = async (req, res) => {
   /**
 * @swagger
 * /api/user/register:
 *   post:
 *      description: Used to register a new user
 *      tags:
 *          - User Registration
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                          - name
 *                          - password
 *                      properties:
 *                          email:
 *                              type: string
 *                              format: email
 *                              minLength: 6
 *                              pattern: /^[a-zA-Z0-9._%+-]+@gmail\.com$/
 *                              example: user@gmail.com
 *                          name:
 *                              type: string
 *                              minLength: 3
 *                              pattern: /^[A-Za-z]{3,}$/
 *                              example: JohnDoe
 *                          password:
 *                              type: string
 *                              minLength: 10
 *                              pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/
 *                              example: Password@123
 *      responses:
 *          '201':
 *              description: User registered successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              message:
 *                                  type: string
 *          '400':
     *              description: Bad Request - Validation error or missing fields
     *              content:
     *                  application/json:
     *                      schema:
     *                          type: object
     *                          properties:
     *                              success:
     *                                  type: boolean
     *                                  example: false
     *                              message:
     *                                  type: string
     *                                  example: "Missing required fields: email, name, or password"
 *          '409':
 *              description: Conflict - User already exists
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: false
 *                              message:
 *                                  type: string
 *                                  example: "User Already Exists!!"
 *          '500':
 *              description: Internal Server Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: false
 *                              message:
 *                                  type: string
 *                                  example: "Something went wrong. Please try again later."
 */


    try {
        const { email, name, password } = req.body;

        // Check for missing fields
        if (!email || !name || !password) {
            return res.status(400).send({
                success: false,
                message: "Missing required fields: email, name, or password"
            });
        }
       
         // Perform validations
         validateEmail(req.body.email);
         validateName(req.body.name);
         validatePassword(req.body.password);

        const userExist = await User.findOne({ email: req.body.email });
        if (userExist) {
            return res.status(409).send({ 
                success: false,
                message: "User Already Exists!!"
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;

        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).send({ 
            success: true,
            message: "Registration Successful!!"
        });
    } catch (error) {
        console.error("Error during user registration:", error);
        if (error.message.includes("Email") || error.message.includes("Name") || error.message.includes("Password")) {
            return res.status(400).send({ 
                success: false,
                message: error.message
            });
        }
        res.status(500).send({
            success: false,
            message: "Something went wrong. Please try again later."
        });
    }
}


const loginUser = async (req, res) => {

    /**
 * @swagger
 *   /api/user/login:
 *   post:
 *     description: Used to login an existing user
 *     tags:
 *       - User Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       '201':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: string
 *                   description: JWT token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       '400':
 *         description: Bad Request - Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email and password are required"
 *       '401':
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       '404':
 *         description: Not Found - User does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User does not exist
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Server error

*/


  const { email, password } = req.body;

  // Check if email or password is missing
  if (!email || !password) {
      return res.status(400).json({
          success: false,
          message: 'Email and password are required'
      });
  }

  try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ // 404 Not Found
              success: false,
              message: 'User does not exist'
          });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ // 401 Unauthorized
              success: false,
              message: 'Invalid credentials'
          });
      }

      // Create and send token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(201).json({ 
          success: true,
          message: 'Login successful',
          data: token
      });
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
          success: false,
          message: 'Server error'
      });
  }
}



  
module.exports={
    userRegister,
    loginUser
}