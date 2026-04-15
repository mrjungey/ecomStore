const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { authenticate, authorize } = require("../middleware/auth");
const { sendMail } = require("../config/email");

// valid status transitions
const statusFlow = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

// place order (COD)
router.post("/", authenticate, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).populate("seller", "name");
      if (!product) return res.status(404).json({ message: "Product not found: " + item.product });
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: "Insufficient stock for " + product.name });
      }

      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images.length > 0 ? product.images[0].url : "",
        seller: product.seller._id,
      });

      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: "cod",
      totalAmount,
      status: "pending",
      statusHistory: [{ status: "pending", note: "Order placed" }],
    });

    sendMail(
      req.user.email,
      "Order Confirmation #" + order._id.toString().slice(-8).toUpperCase(),
      "<h2>Order Placed</h2><p>Your order of Rs. " + totalAmount + " has been placed. Payment: Cash on Delivery.</p>"
    );

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get my orders (customer)
router.get("/my", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name images");
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get single order
router.get("/:id", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("items.product", "name images")
      .populate("items.seller", "name");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // only allow customer, seller of an item, or admin
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isSeller = order.items.some((i) => i.seller && i.seller._id && i.seller._id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isSeller && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get orders for seller
router.get("/seller/list", authenticate, authorize("seller"), async (req, res) => {
  try {
    const orders = await Order.find({ "items.seller": req.user._id })
      .sort({ createdAt: -1 })
      .populate("customer", "name email")
      .populate("items.product", "name images");
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// all orders (admin)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("customer", "name email");

    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update order status (admin or seller)
router.put("/:id/status", authenticate, authorize("admin", "seller"), async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const allowed = statusFlow[order.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        message: "Cannot change status from " + order.status + " to " + status,
      });
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || "", date: new Date() });
    await order.save();

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// cancel order (customer, only if pending)
router.put("/:id/cancel", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your order" });
    }
    if (order.status !== "pending") {
      return res.status(400).json({ message: "Can only cancel pending orders" });
    }

    // restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.status = "cancelled";
    order.statusHistory.push({ status: "cancelled", note: "Cancelled by customer" });
    await order.save();

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
