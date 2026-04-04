import { db } from "../db.js";
import bcrypt from "bcrypt";

// 🔹 OBTENER EMPLEADOS ACTIVOS
export const getEmpleados = (req, res) => {
  db.query("SELECT * FROM empleados WHERE estado='activo'", (err, result) => {
    if (err) {
      console.error("ERROR GET:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
};

// 🔹 CONTAR EMPLEADOS ACTIVOS (DASHBOARD)
export const countEmpleados = (req, res) => {
  db.query(
    "SELECT COUNT(*) AS total FROM empleados WHERE estado='activo'",
    (err, result) => {
      if (err) {
        console.error("ERROR COUNT:", err);
        return res.status(500).json(err);
      }
      res.json(result[0]);
    }
  );
};

// 🔹 CREAR EMPLEADO
export const createEmpleado = (req, res) => {

  const {
    nombre,
    cedula,
    correo,
    cargo,
    salario,
    fechaIngreso,
    departamento,
    fechaNacimiento
  } = req.body;

  if (!nombre || !cedula || !cargo) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const sql = `
    INSERT INTO empleados 
    (nombre, documento, correo, cargo, salario, fecha_ingreso, departamento, estado, fecha_nacimiento)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'activo', ?)
  `;

  db.query(
    sql,
    [
      nombre,
      cedula,
      correo,
      cargo,
      salario,
      fechaIngreso,
      departamento || null,
      fechaNacimiento || null
    ],
    async (err, result) => {

      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      const empleadoId = result.insertId;

      // 🔐 PASSWORD TEMPORAL
      // 🔐 PASSWORD TEMPORAL
      const defaultPassword = cedula; // o "Temp123*"
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const sqlUser = `
        INSERT INTO usuarios (nombre, correo, password, rol, empleado_id, username)
        VALUES (?, ?, ?, 'empleado', ?, ?)
      `;

      db.query(
        sqlUser,
        [nombre, correo, hashedPassword, empleadoId, cedula],
        (err) => {

          if (err) {
            console.error("Error creando usuario:", err);
            return res.status(500).json(err);
          }

          res.json({
            message: "Empleado y usuario creados",
            credenciales: {
              username: cedula,
              password: defaultPassword
            }
          });

        }
      );

    }
  );
};

// 🔹 ACTUALIZAR EMPLEADO
export const updateEmpleado = (req, res) => {
  const { id } = req.params;
  const { nombre, cargo, departamento } = req.body;

  const sql = `
    UPDATE empleados 
    SET nombre=?, cargo=?, departamento=? 
    WHERE id=?
  `;

  db.query(
    sql,
    [nombre, cargo, departamento || null, id],
    (err) => {
      if (err) {
        console.error("ERROR UPDATE:", err);
        return res.status(500).json(err);
      }

      res.json({ message: "Empleado actualizado" });
    }
  );
};

// 🔥 ELIMINAR → MOVER A EXEMPLEADOS
export const deleteEmpleado = (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  if (!motivo || motivo.trim() === "") {
    return res.status(400).json({ message: "Motivo obligatorio" });
  }

  // 1️⃣ Obtener empleado
  db.query("SELECT * FROM empleados WHERE id=?", [id], (err, result) => {
    if (err) {
      console.error("ERROR SELECT:", err);
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const emp = result[0];

    // 2️⃣ Insertar en exempleados
    const insertEx = `
      INSERT INTO exempleados 
      (nombre, documento, correo, telefono, cargo, departamento, fecha_ingreso, fecha_retiro, razon_despido)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;

    db.query(
      insertEx,
      [
        emp.nombre,
        emp.documento,
        emp.correo,
        emp.telefono || null,
        emp.cargo,
        emp.departamento || null,
        emp.fecha_ingreso,
        motivo
      ],
      (err) => {
        if (err) {
          console.error("ERROR INSERT EX:", err);
          return res.status(500).json(err);
        }

        // 3️⃣ Eliminar de empleados
        db.query("DELETE FROM empleados WHERE id=?", [id], (err) => {
          if (err) {
            console.error("ERROR DELETE:", err);
            return res.status(500).json(err);
          }

          res.json({
            message: "Empleado movido a exempleados correctamente"
          });
        });
      }
    );
  });
};

// 🔹 OBTENER EXEMPLEADOS
export const getExEmpleados = (req, res) => {
  db.query(
    "SELECT * FROM exempleados ORDER BY fecha_retiro DESC",
    (err, result) => {
      if (err) {
        console.error("ERROR GET EX:", err);
        return res.status(500).json(err);
      }
      res.json(result);
    }
  );
};

// 🔥 ELIMINAR DEFINITIVAMENTE EXEMPLEADO
export const deleteExEmpleado = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM exempleados WHERE id=?", [id], (err) => {
    if (err) {
      console.error("ERROR DELETE EX:", err);
      return res.status(500).json(err);
    }

    res.json({ message: "Exempleado eliminado definitivamente" });
  });
};

// 🎂 EMPLEADOS QUE CUMPLEN AÑOS ESTE MES
export const getCumpleaneros = (req, res) => {
  const sql = `
    SELECT id, nombre, fecha_nacimiento
    FROM empleados
    WHERE estado='activo'
    AND MONTH(fecha_nacimiento) = MONTH(CURDATE())
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("ERROR CUMPLEAÑOS:", err);
      return res.status(500).json(err);
    }

    res.json(result);
  });
};

// 🔍 BUSCAR EMPLEADO POR NOMBRE
export const searchEmpleado = (req, res) => {
  const { q } = req.query;

  const sql = `
    SELECT id, nombre, cargo, departamento 
    FROM empleados 
    WHERE nombre LIKE ?
    LIMIT 5
  `;

  db.query(sql, [`%${q}%`], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json(result);
  });
};

// 🔹 OBTENER EMPLEADO POR ID
export const getEmpleadoById = (req, res) => {
  const { id } = req.params; // ID que viene de la URL

  db.query("SELECT * FROM empleados WHERE id=?", [id], (err, result) => {
    if (err) {
      console.error("ERROR GET BY ID:", err);
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    res.json(result[0]); // retornamos un solo empleado
  });
};

// 🔹 OBTENER DATOS PARA CERTIFICADO
export const getCertificadoEmpleado = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT nombre, cargo, salario, fecha_ingreso
    FROM empleados
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("ERROR CERTIFICADO:", err);
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    res.json(result[0]);
  });
};