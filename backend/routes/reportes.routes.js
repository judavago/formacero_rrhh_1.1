import express from "express";
import { crearReporte, getReportes, updateReporte, deleteReporte } from "../controllers/reportes.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roleAuth.js";

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// GET puede ser accedido por usuarios autenticados
router.get("/", getReportes);

// Crear, actualizar y eliminar requieren admin
router.use(requireAdmin);
router.post("/", crearReporte);
router.put("/:id", updateReporte);
router.delete("/:id", deleteReporte);

export default router;