import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = (req, res) => {

  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({
      message: "Correo y contraseña son obligatorios"
    });
  }

  const sql = "SELECT * FROM usuarios WHERE correo=?";

  db.query(sql, [correo], async (err, result) => {

    if (err) {
      return res.status(500).json({ message: "Error servidor" });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Usuario no existe"
      });
    }

    const user = result[0];

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

  });

};