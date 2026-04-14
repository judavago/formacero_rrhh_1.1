import bcrypt from "bcrypt";
import { supabase } from "./config/supabase.js";

const createAdmin = async () => {

  const correo = "admin@formacero.com";

  try {

    // 🔍 Verificar si ya existe
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("correo", correo)
      .limit(1);

    if (error) {
      console.error("❌ Error consultando:", error);
      process.exit();
    }

    if (data && data.length > 0) {
      console.log("⚠️ El admin ya existe, no se creó otro");
      process.exit();
    }

    // 🔐 Encriptar contraseña
    const password = "Admin123*";
    const hashed = await bcrypt.hash(password, 10);

    // 💾 Insertar admin
    const { error: insertError } = await supabase
      .from("usuarios")
      .insert([{
        nombre: "Administrador",
        correo,
        password: hashed,
        rol: "admin"
      }]);

    if (insertError) {
      console.error("❌ Error insertando:", insertError);
      process.exit();
    }

    console.log("✅ Admin creado correctamente");
    console.log("📧 Correo: admin@formacero.com");
    console.log("🔑 Password: Admin123*");

    process.exit();

  } catch (error) {
    console.error("❌ Error general:", error);
    process.exit();
  }

};

createAdmin();