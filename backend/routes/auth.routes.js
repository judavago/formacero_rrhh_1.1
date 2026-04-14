import express from "express";
import { login } from "../controllers/auth.controller.js";

const router = express.Router();

// 🔐 LOGIN
router.post("/login", login);

// 🔍 TEST (opcional para verificar backend)
router.get("/test", (req, res) => {
  res.json({ message: "Auth funcionando correctamente" });
});

export default router;