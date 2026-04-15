const router = require("express").Router();
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const { authenticate } = require("../middleware/auth");

// get or create a chat between two users (optionally about a product)
router.post("/start", authenticate, async (req, res) => {
  try {
    const { sellerId, productId } = req.body;
    const myId = req.user._id;

    // look for existing chat between these two users
    let chat = await Chat.findOne({
      participants: { $all: [myId, sellerId] },
    }).populate("participants", "name email role");

    if (!chat) {
      chat = await Chat.create({
        participants: [myId, sellerId],
        product: productId || null,
      });
      chat = await Chat.findById(chat._id).populate("participants", "name email role");
    }

    // if a product context is provided and chat didn't have one, update it
    if (productId && !chat.product) {
      chat.product = productId;
      await chat.save();
    }

    res.json({ chat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// list my chats
router.get("/", authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate("participants", "name email role")
      .populate("product", "name images")
      .sort({ lastMessageAt: -1 });

    // attach unread count for each chat
    const result = [];
    for (const chat of chats) {
      const unread = await Message.countDocuments({
        chat: chat._id,
        sender: { $ne: req.user._id },
        read: false,
      });
      result.push({ ...chat.toObject(), unreadCount: unread });
    }

    res.json({ chats: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get messages in a chat
router.get("/:chatId/messages", authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat || !chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    // mark messages as read
    await Message.updateMany(
      { chat: req.params.chatId, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// send a message
router.post("/:chatId/messages", authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat || !chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = await Message.create({
      chat: chat._id,
      sender: req.user._id,
      text: req.body.text,
    });

    chat.lastMessage = req.body.text;
    chat.lastMessageAt = new Date();
    await chat.save();

    const populated = await Message.findById(message._id).populate("sender", "name");

    // emit via socket
    const io = req.app.get("io");
    io.to(chat._id.toString()).emit("new_message", populated);

    res.status(201).json({ message: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
