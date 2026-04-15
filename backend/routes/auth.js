const router = require("express").Router() 
const jwt = require("jsonwebtoken") 
const User = require("../models/User") 
const { sendMail } = require("../config/email") 
const { authenticate } = require("../middleware/auth") 

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" }) 
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body 

    const exists = await User.findOne({ email }) 
    if (exists) return res.status(400).json({ message: "Email already registered" }) 

    const user = await User.create({ name, email, password, phone, address, role: "customer" }) 
    const token = generateToken(user) 

    sendMail(
      email,
      "Welcome to our store!",
      "<h2>Hi " + name + ",</h2><p>Your account has been created successfully.</p>"
    ) 

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body 

    const user = await User.findOne({ email }) 
    if (!user) return res.status(400).json({ message: "Invalid credentials" }) 

    const valid = await user.comparePassword(password) 
    if (!valid) return res.status(400).json({ message: "Invalid credentials" }) 

    const token = generateToken(user) 

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user }) 
}) 

router.put("/profile", authenticate, async (req, res) => {
  try {
    const { name, phone, address } = req.body 
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true }
    ).select("-password") 
    res.json({ user }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

module.exports = router 
