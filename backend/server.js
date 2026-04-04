import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import empleadosRoutes from "./routes/empleados.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";

const app = express();

// 🔹 MIDDLEWARES
app.use(cors());
app.use(express.json());

// 🔹 RUTA DE PRUEBA
app.get("/", (req, res) => {
  res.send("✅ API Formacero funcionando");
});

// 🔹 RUTAS PRINCIPALES
app.use("/api/empleados", empleadosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reportes", reportesRoutes);

// 🔴 MANEJO DE RUTAS NO EXISTENTES
app.use((req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada"
  });
});

// 🔴 MANEJO DE ERRORES GLOBAL
app.use((err, req, res, next) => {
  console.error("ERROR GLOBAL:", err);
  res.status(500).json({
    message: "Error interno del servidor"
  });
});

// 🚀 SERVER
app.listen(3001, () => {
  console.log("🚀 Backend corriendo en http://localhost:3001");
});