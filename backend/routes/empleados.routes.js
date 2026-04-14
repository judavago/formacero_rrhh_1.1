import express from "express";
import {
  searchEmpleado, 
  getEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  countEmpleados,
  getExEmpleados,
  deleteExEmpleado,
  getCumpleaneros,
  getEmpleadoById,
  getCertificadoEmpleado
} from "../controllers/empleados.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔐 Middleware global (evita repetirlo en cada ruta)
router.use(verifyToken);

// 🔍 =============================
// BUSQUEDAS Y CONSULTAS
// =============================
router.get("/search", searchEmpleado);           
router.get("/count", countEmpleados);
router.get("/cumpleaneros", getCumpleaneros);
router.get("/exempleados", getExEmpleados);

// 📄 =============================
// CERTIFICADOS
// =============================
router.get("/certificado/:id", getCertificadoEmpleado);

// 🧾 =============================
// CRUD GENERAL
// =============================
router.get("/", getEmpleados);
router.post("/", createEmpleado);
router.put("/:id", updateEmpleado);
router.delete("/:id", deleteEmpleado);

// 🗑 =============================
// EX-EMPLEADOS
// =============================
router.delete("/exempleados/:id", deleteExEmpleado);

// 👤 =============================
// DETALLE POR ID (SIEMPRE AL FINAL)
// =============================
router.get("/:id", getEmpleadoById);

export default router;