const router = require("express").Router();
const Product = require("../models/Product");
const upload = require("../middleware/upload");
const { authenticate, authorize } = require("../middleware/auth");
const fs = require("fs");
const mongoose = require("mongoose");

console.log("✅ products route loaded");

let cloudinary = null;
try {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary = require("../config/cloudinary");
  }
} catch (e) {
  console.log("Cloudinary not configured, images will be stored locally");
}

// ✅ Upload helper
async function uploadImages(files) {
  const images = [];

  for (const file of files) {
    if (cloudinary) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });

      images.push({
        url: result.secure_url,
        publicId: result.public_id,
      });

      fs.unlinkSync(file.path);
    } else {
      images.push({
        url: "/uploads/" + file.filename,
        publicId: "",
      });
    }
  }

  return images;
}

// ✅ GET PRODUCTS (FIXED)
router.get("/", async (req, res) => {
  try {
    const { category, seller, search, sort, page = 1, limit = 12 } = req.query;

    const filter = {};

    if (category) filter.category = category;

    // 🔥 FIX: prevent invalid ObjectId crash
    if (seller && mongoose.Types.ObjectId.isValid(seller)) {
      filter.seller = seller;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { averageRating: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("seller", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });

  } catch (err) {
    console.error("🔥 GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("seller", "name email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });

  } catch (err) {
    console.error("🔥 GET PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ CREATE PRODUCT (FIXED)
router.post(
  "/",
  authenticate,
  authorize("seller", "admin"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      console.log("USER:", req.user);
      console.log("BODY:", req.body);

      // 🔐 Prevent crash
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { name, description, price, stock, category } = req.body;

      // ✅ Validation
      if (!name || !price || !stock || !category) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let images = [];

      if (req.files && req.files.length > 0) {
        images = await uploadImages(req.files);
      }

      const product = await Product.create({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        seller: req.user._id,
        images,
      });

      res.status(201).json({ product });

    } catch (err) {
      console.error("🔥 CREATE PRODUCT ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ✅ UPDATE PRODUCT
router.put(
  "/:id",
  authenticate,
  authorize("seller", "admin"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (
        req.user.role === "seller" &&
        product.seller.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "Not your product" });
      }

      const { name, description, price, stock, category } = req.body;

      if (name) product.name = name;
      if (description) product.description = description;
      if (price) product.price = parseFloat(price);
      if (stock !== undefined) product.stock = parseInt(stock);
      if (category) product.category = category;

      if (req.files && req.files.length > 0) {
        if (cloudinary) {
          for (const img of product.images) {
            if (img.publicId) {
              await cloudinary.uploader.destroy(img.publicId);
            }
          }
        }

        product.images = await uploadImages(req.files);
      }

      await product.save();

      res.json({ product });

    } catch (err) {
      console.error("🔥 UPDATE PRODUCT ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ✅ DELETE PRODUCT
router.delete(
  "/:id",
  authenticate,
  authorize("seller", "admin"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (
        req.user.role === "seller" &&
        product.seller.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "Not your product" });
      }

      if (cloudinary) {
        for (const img of product.images) {
          if (img.publicId) {
            await cloudinary.uploader.destroy(img.publicId);
          }
        }
      }

      await product.deleteOne();

      res.json({ message: "Product deleted" });

    } catch (err) {
      console.error("🔥 DELETE PRODUCT ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;