const router = require("express").Router() 
const User = require("../models/User") 
const Order = require("../models/Order") 
const Product = require("../models/Product") 
const { authenticate, authorize } = require("../middleware/auth") 

// dashboard stats
router.get("/stats", authenticate, authorize("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments() 
    const totalProducts = await Product.countDocuments() 
    const totalOrders = await Order.countDocuments() 
    const revenue = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]) 

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenue.length > 0 ? revenue[0].total : 0,
    }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

// list all users
router.get("/users", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }) 
    res.json({ users }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

// create seller account
router.post("/sellers", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body 

    const exists = await User.findOne({ email }) 
    if (exists) return res.status(400).json({ message: "Email already exists" }) 

    const seller = await User.create({ name, email, password, phone, role: "seller" }) 
    res.status(201).json({ seller: { id: seller._id, name: seller.name, email: seller.email, role: seller.role } }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

module.exports = router 
