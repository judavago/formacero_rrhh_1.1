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

// 🔥 NUEVO IMPORT
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();


// 🔹 =============================
// 🔍 BUSQUEDAS Y CONSULTAS
// =============================
router.get("/search", verifyToken, searchEmpleado);           
router.get("/count", verifyToken, countEmpleados);
router.get("/cumpleaneros", verifyToken, getCumpleaneros);
router.get("/exempleados", verifyToken, getExEmpleados);


// 🔹 =============================
// 📄 CERTIFICADOS (ANTES DE :id)
// =============================
router.get("/certificado/:id", verifyToken, getCertificadoEmpleado);


// 🔹 =============================
// 🧾 CRUD GENERAL
// =============================
router.get("/", verifyToken, getEmpleados);
router.post("/", verifyToken, createEmpleado);
router.put("/:id", verifyToken, updateEmpleado);
router.delete("/:id", verifyToken, deleteEmpleado);


// 🔹 =============================
// 🗑 EX-EMPLEADOS
// =============================
router.delete("/exempleados/:id", verifyToken, deleteExEmpleado);


// 🔹 =============================
// 👤 DETALLE POR ID (SIEMPRE AL FINAL)
// =============================
router.get("/:id", verifyToken, getEmpleadoById);


export default router;