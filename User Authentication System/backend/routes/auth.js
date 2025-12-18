const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// SIGNUP
router.post('/signup', async (req,res)=>{
  const { name, email, password } = req.body;
  try{
    const existingUser = await User.findOne({email});
    if(existingUser) return res.status(400).json({msg:"User exists"});
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({name,email,password:hashed});
    await user.save();
    res.json({msg:"Signup successful"});
  } catch(err){
    res.status(500).json({msg:err.message});
  }
});

// LOGIN
router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  try{
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({msg:"Invalid credentials"});
    const match = await bcrypt.compare(password,user.password);
    if(!match) return res.status(400).json({msg:"Invalid credentials"});
    res.json({msg:"Login successful", user:{name:user.name,email:user.email}});
  }catch(err){
    res.status(500).json({msg:err.message});
  }
});

module.exports = router;
