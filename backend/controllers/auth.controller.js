import { supabase } from "../config/supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const login = async (req, res) => {

  const { usuario, correo, password } = req.body;
  const loginValue = (usuario || correo || "").trim();

  if (!loginValue || !password) {
    return res.status(400).json({
      message: "Usuario y contraseña son obligatorios"
    });
  }

  try {

    // 🔍 Buscar usuario por correo o cédula
    let { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("correo", loginValue)
      .limit(1);

    if (error) {
      console.error("ERROR DB:", error);
      return res.status(500).json({ message: "Error servidor" });
    }

    if (!data || data.length === 0) {
      const fallback = await supabase
        .from("usuarios")
        .select("*")
        .eq("username", loginValue)
        .limit(1);

      if (fallback.error) {
        console.error("ERROR DB fallback:", fallback.error);
        return res.status(500).json({ message: "Error servidor" });
      }

      data = fallback.data;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "Usuario no existe"
      });
    }

    const user = data[0];

    try {

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({
          message: "Contraseña incorrecta"
        });
      }

      // 🔐 TOKEN (PRODUCCIÓN)
      const token = jwt.sign(
        {
          id: user.id,
          rol: user.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      res.json({
        message: "Login exitoso",
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          rol: user.rol,
          empleado_id: user.empleado_id
        }
      });

    } catch (error) {
      return res.status(500).json({
        message: "Error validando contraseña"
      });
    }

  } catch (err) {
    console.error("ERROR GENERAL:", err);
    return res.status(500).json({
      message: "Error servidor"
    });
  }

};

export const forgotPassword = async (req, res) => {
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).json({ message: "Correo es obligatorio" });
  }

  try {
    // Buscar usuario por correo
    const { data: user, error } = await supabase
      .from("usuarios")
      .select("id, correo")
      .eq("correo", correo)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Generar token único y expiración (1 hora)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000);  // 1 hora

    // Guardar token en DB
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ reset_token: resetToken, reset_expires: resetExpires })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error guardando token:", updateError);
      return res.status(500).json({ message: "Error interno" });
    }

    // Enviar email
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: correo,
      subject: "Recuperación de contraseña - Formacero RRHH",
      html: `<p>Haz clic en el enlace para restablecer tu contraseña: <a href="${resetUrl}">${resetUrl}</a></p><p>Expira en 1 hora.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Email de recuperación enviado" });
  } catch (err) {
    console.error("Error en forgotPassword:", err);
    res.status(500).json({ message: "Error interno" });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token y nueva contraseña son obligatorios" });
  }

  try {
    // Buscar usuario por token y verificar expiración
    const { data: user, error } = await supabase
      .from("usuarios")
      .select("id, reset_expires")
      .eq("reset_token", token)
      .single();

    if (error || !user || new Date() > new Date(user.reset_expires)) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar token
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ password: hashedPassword, reset_token: null, reset_expires: null })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error actualizando contraseña:", updateError);
      return res.status(500).json({ message: "Error interno" });
    }

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    console.error("Error en resetPassword:", err);
    res.status(500).json({ message: "Error interno" });
  }
};