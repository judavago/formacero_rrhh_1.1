import express from "express";
import { login, forgotPassword, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

// 🔐 LOGIN
router.post("/login", login);

// 🔍 TEST (opcional para verificar backend)
router.get("/test", (req, res) => {
  res.json({ message: "Auth funcionando correctamente" });
});

// 🔑 FORGOT PASSWORD
router.post("/forgot-password", forgotPassword);

// 🔑 RESET PASSWORD
router.post("/reset-password", resetPassword);

export default router;