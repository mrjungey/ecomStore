const router = require("express").Router() 
const Review = require("../models/Review") 
const Product = require("../models/Product") 
const { authenticate } = require("../middleware/auth") 

router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 }) 
    res.json({ reviews }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

router.post("/", authenticate, async (req, res) => {
  try {
    const { product, rating, comment } = req.body 

    const existing = await Review.findOne({ product, user: req.user._id }) 
    if (existing) return res.status(400).json({ message: "You already reviewed this product" }) 

    const review = await Review.create({ product, user: req.user._id, rating, comment }) 

    // update product average
    const reviews = await Review.find({ product }) 
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    await Product.findByIdAndUpdate(product, { averageRating: avg.toFixed(1), totalReviews: reviews.length }) 

    res.status(201).json({ review }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

module.exports = router 
