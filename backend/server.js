const express = require("express") 
const http = require("http") 
const mongoose = require("mongoose") 
const cors = require("cors") 
const { Server } = require("socket.io") 
require("dotenv").config() 

const authRoutes = require("./routes/auth") 
const productRoutes = require("./routes/products") 
const categoryRoutes = require("./routes/categories") 
const orderRoutes = require("./routes/orders") 
const reviewRoutes = require("./routes/reviews") 
const wishlistRoutes = require("./routes/wishlist") 
const chatRoutes = require("./routes/chat") 
const adminRoutes = require("./routes/admin") 

const app = express() 
const server = http.createServer(app) 

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true },
}) 

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true })) 
app.use(express.json()) 
app.use("/uploads", express.static("/tmp")) 

// make io accessible in routes
app.set("io", io) 

// socket handling
const onlineUsers = new Map() 

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id) 
    socket.userId = userId 
  }) 

  socket.on("join_chat", (chatId) => {
    socket.join(chatId) 
  }) 

  socket.on("typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("user_typing", { chatId, userId }) 
  }) 

  socket.on("stop_typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("user_stop_typing", { chatId, userId }) 
  }) 

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId) 
    }
  }) 
}) 

app.set("onlineUsers", onlineUsers) 

// routes
app.use("/api/auth", authRoutes) 
app.use("/api/products", productRoutes) 
app.use("/api/categories", categoryRoutes) 
app.use("/api/orders", orderRoutes) 
app.use("/api/reviews", reviewRoutes) 
app.use("/api/wishlist", wishlistRoutes) 
app.use("/api/chat", chatRoutes) 
app.use("/api/admin", adminRoutes) 

// health check
app.get("/api/health", (req, res) => res.json({ status: "ok" })) 

const PORT = process.env.PORT || 5000 

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB") 
    server.listen(PORT, () => console.log("Server running on port " + PORT)) 
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message) 
    process.exit(1) 
  }) 
