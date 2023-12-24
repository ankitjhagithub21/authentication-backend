const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const secretKey = 'alakjdjdkd'; 

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  

  jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
    if (err) {
      console.error('Token Verification Error:', err);
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }


    req.user = decoded;
    next();
  });
};



router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'Email not exist!' });
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
       
        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

        res.status(200).json({
          message: 'Login Successful',
          user: user,
          token: token,
        });
      } else {
        res.status(401).json({
          message: 'Wrong Password',
        });
      }
    }
  } catch (err) {
    res.status(500).json({ "Error": err });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    
   
   
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists!' });
    }


    if (password.length < 8) {
      return res.status(400).json({ message: 'Password should be at least 8 characters long!' });
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      password: hashPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration Successful!' });
  } catch (err) {
    res.status(500).json({ "Error": err });
  }
});

router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    res.status(200).json({ user });
  } catch (err) {
    console.error('Error fetching user information:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
