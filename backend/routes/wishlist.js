const router = require("express").Router() 
const Wishlist = require("../models/Wishlist") 
const { authenticate } = require("../middleware/auth") 

router.get("/", authenticate, async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user._id }).populate({
      path: "product",
      populate: { path: "category", select: "name" },
    }) 
    res.json({ items }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

router.post("/", authenticate, async (req, res) => {
  try {
    const { product } = req.body 
    const existing = await Wishlist.findOne({ user: req.user._id, product }) 
    if (existing) return res.status(400).json({ message: "Already in wishlist" }) 

    const item = await Wishlist.create({ user: req.user._id, product }) 
    res.status(201).json({ item }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

router.delete("/:productId", authenticate, async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ user: req.user._id, product: req.params.productId }) 
    res.json({ message: "Removed from wishlist" }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

module.exports = router 
