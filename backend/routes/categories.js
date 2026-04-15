const router = require("express").Router() 
const Category = require("../models/Category") 
const { authenticate, authorize } = require("../middleware/auth") 

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }) 
    res.json({ categories }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

router.post("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const category = await Category.create(req.body) 
    res.status(201).json({ category }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true }) 
    if (!category) return res.status(404).json({ message: "Category not found" }) 
    res.json({ category }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id) 
    res.json({ message: "Category deleted" }) 
  } catch (err) {
    res.status(500).json({ message: err.message }) 
  }
}) 

module.exports = router 
