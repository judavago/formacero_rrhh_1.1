import bcrypt from "bcrypt";
import { db } from "../db.js";
const createAdmin = async () => {

  const correo = "admin@formacero.com";

  try {

    // 🔍 Verificar si ya existe
    db.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo],
      async (err, results) => {

        if (err) {
          console.error("❌ Error consultando:", err);
          process.exit();
        }

        if (results.length > 0) {
          console.log("⚠️ El admin ya existe, no se creó otro");
          process.exit();
        }

        // 🔐 Encriptar contraseña
        const password = "Admin123*";
        const hashed = await bcrypt.hash(password, 10);

        // 💾 Insertar admin
        db.query(
          "INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)",
          ["Administrador", correo, hashed, "admin"],
          (err) => {
            if (err) {
              console.error("❌ Error insertando:", err);
              process.exit();
            }

            console.log("✅ Admin creado correctamente");
            console.log("📧 Correo: admin@formacero.com");
            console.log("🔑 Password: Admin123*");

            process.exit();
          }
        );

      }
    );

  } catch (error) {
    console.error("❌ Error general:", error);
    process.exit();
  }

};

createAdmin();