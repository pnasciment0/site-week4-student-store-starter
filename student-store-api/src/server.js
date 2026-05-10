const express = require("express");
const cors = require("cors");
const productsRouter = require("./routers/products");
const ordersRouter = require("./routers/orders");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Student Store API!" });
});

app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
