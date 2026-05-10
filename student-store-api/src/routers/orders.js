const express = require("express");
const prisma = require("../db/db");

const router = express.Router();

// GET /orders — fetch all orders
router.get("/", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { orderItems: true },
    });
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /orders/:id — fetch a single order with its items
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
    if (!order) {
      return res.status(404).json({ error: `Order with id ${id} not found` });
    }
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /orders — atomically create an order and its items, then calculate totalPrice
// Request body: { customer, status, items: [{ productId, quantity }] }
router.post("/", async (req, res) => {
  const { customer, status, items } = req.body;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Look up the real price for each product from the DB — never trust client-sent prices
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      // Build a quick lookup map: productId -> price
      const priceMap = Object.fromEntries(
        products.map((p) => [p.id, p.price])
      );

      // Verify every requested productId actually exists
      for (const item of items) {
        if (priceMap[item.productId] === undefined) {
          throw new Error(`Product with id ${item.productId} not found`);
        }
      }

      // Calculate totalPrice from real product prices * quantities
      const totalPrice = items.reduce(
        (sum, item) => sum + priceMap[item.productId] * item.quantity,
        0
      );

      // Create the Order and all OrderItems in one atomic operation
      return tx.order.create({
        data: {
          customer,
          status,
          totalPrice,
          orderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: priceMap[item.productId],
            })),
          },
        },
        include: { orderItems: true },
      });
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /orders/:id — update order metadata (e.g. status)
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { customer, status } = req.body;
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { customer, status },
      include: { orderItems: true },
    });
    res.json(order);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: `Order with id ${id} not found` });
    }
    res.status(400).json({ error: err.message });
  }
});

// DELETE /orders/:id — delete order (OrderItems cascade automatically)
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.order.delete({ where: { id } });
    res.json({ message: `Order with id ${id} successfully deleted`, id });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: `Order with id ${id} not found` });
    }
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
