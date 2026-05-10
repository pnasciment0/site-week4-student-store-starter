const express = require("express");
const prisma = require("../db/db");

const router = express.Router();

// GET /products — fetch all products, with optional ?category= and ?sort= filters
router.get("/", async (req, res) => {
  const { category, sort } = req.query;

  const where = category ? { category } : {};

  const validSortFields = { name: "name", price: "price" };
  const orderBy = validSortFields[sort]
    ? { [validSortFields[sort]]: sort === "price" ? "desc" : "asc" }
    : undefined;

  try {
    const products = await prisma.product.findMany({
      where,
      ...(orderBy && { orderBy }),
    });
    res.json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /products/:id — fetch a single product by ID
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: `Product with id ${id} not found` });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /products — create a new product
router.post("/", async (req, res) => {
  const { name, description, price, imageUrl, category } = req.body;
  try {
    const product = await prisma.product.create({
      data: { name, description, price, imageUrl, category },
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /products/:id — update an existing product
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description, price, imageUrl, category } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { name, description, price, imageUrl, category },
    });
    res.json(product);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: `Product with id ${id} not found` });
    }
    res.status(400).json({ error: err.message });
  }
});

// DELETE /products/:id — remove a product
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: `Product with id ${id} successfully deleted`, id });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: `Product with id ${id} not found` });
    }
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
