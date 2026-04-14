import { supabase } from "../config/supabase.js";
import bcrypt from "bcrypt";

// 🔹 OBTENER EMPLEADOS ACTIVOS
export const getEmpleados = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("empleados")
      .select("*")
      .eq("estado", "activo");

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("ERROR GET:", err);
    res.status(500).json(err);
  }
};

// 🔹 CONTAR EMPLEADOS ACTIVOS (DASHBOARD)
export const countEmpleados = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from("empleados")
      .select("*", { count: "exact", head: true })
      .eq("estado", "activo");

    if (error) throw error;

    res.json({ total: count });
  } catch (err) {
    console.error("ERROR COUNT:", err);
    res.status(500).json(err);
  }
};

// 🔹 CREAR EMPLEADO
export const createEmpleado = async (req, res) => {
  try {
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

    // 1️⃣ Insertar empleado
    const { data: empleadoData, error: empError } = await supabase
      .from("empleados")
      .insert([{
        nombre,
        documento: cedula,
        correo,
        cargo,
        salario,
        fecha_ingreso: fechaIngreso,
        departamento: departamento || null,
        estado: "activo",
        fecha_nacimiento: fechaNacimiento || null
      }])
      .select();

    if (empError) throw empError;

    const empleadoId = empleadoData[0].id;

    // 2️⃣ Crear usuario
    const defaultPassword = cedula;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const { error: userError } = await supabase
      .from("usuarios")
      .insert([{
        nombre,
        correo,
        password: hashedPassword,
        rol: "empleado",
        empleado_id: empleadoId,
        username: cedula
      }]);

    if (userError) throw userError;

    res.json({
      message: "Empleado y usuario creados",
      credenciales: {
        username: cedula,
        password: defaultPassword
      }
    });

  } catch (err) {
    console.error("ERROR CREATE:", err);
    res.status(500).json(err);
  }
};

// 🔹 ACTUALIZAR EMPLEADO
export const updateEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cargo, departamento } = req.body;

    const { error } = await supabase
      .from("empleados")
      .update({
        nombre,
        cargo,
        departamento: departamento || null
      })
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Empleado actualizado" });
  } catch (err) {
    console.error("ERROR UPDATE:", err);
    res.status(500).json(err);
  }
};

// 🔥 ELIMINAR → MOVER A EXEMPLEADOS
export const deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!motivo || motivo.trim() === "") {
      return res.status(400).json({ message: "Motivo obligatorio" });
    }

    // 1️⃣ Obtener empleado
    const { data: empleado, error: selectError } = await supabase
      .from("empleados")
      .select("*")
      .eq("id", id)
      .single();

    if (selectError) throw selectError;

    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    // 2️⃣ Insertar en exempleados
    const { error: insertError } = await supabase
      .from("exempleados")
      .insert([{
        nombre: empleado.nombre,
        documento: empleado.documento,
        correo: empleado.correo,
        telefono: empleado.telefono || null,
        cargo: empleado.cargo,
        departamento: empleado.departamento || null,
        fecha_ingreso: empleado.fecha_ingreso,
        fecha_retiro: new Date(),
        razon_despido: motivo
      }]);

    if (insertError) throw insertError;

    // 3️⃣ Eliminar de empleados
    const { error: deleteError } = await supabase
      .from("empleados")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    res.json({
      message: "Empleado movido a exempleados correctamente"
    });

  } catch (err) {
    console.error("ERROR DELETE:", err);
    res.status(500).json(err);
  }
};

// 🔹 OBTENER EXEMPLEADOS
export const getExEmpleados = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("exempleados")
      .select("*")
      .order("fecha_retiro", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("ERROR GET EX:", err);
    res.status(500).json(err);
  }
};

// 🔥 ELIMINAR DEFINITIVAMENTE EXEMPLEADO
export const deleteExEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("exempleados")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Exempleado eliminado definitivamente" });
  } catch (err) {
    console.error("ERROR DELETE EX:", err);
    res.status(500).json(err);
  }
};

// 🎂 EMPLEADOS QUE CUMPLEN AÑOS ESTE MES
export const getCumpleaneros = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;

    const { data, error } = await supabase
      .from("empleados")
      .select("id, nombre, fecha_nacimiento")
      .eq("estado", "activo");

    if (error) throw error;

    const filtrados = data.filter(emp => {
      if (!emp.fecha_nacimiento) return false;
      const mes = new Date(emp.fecha_nacimiento).getMonth() + 1;
      return mes === currentMonth;
    });

    res.json(filtrados);

  } catch (err) {
    console.error("ERROR CUMPLEAÑOS:", err);
    res.status(500).json(err);
  }
};

// 🔍 BUSCAR EMPLEADO POR NOMBRE
export const searchEmpleado = async (req, res) => {
  try {
    const { q } = req.query;

    const { data, error } = await supabase
      .from("empleados")
      .select("id, nombre, cargo, departamento")
      .ilike("nombre", `%${q}%`)
      .limit(5);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("ERROR SEARCH:", err);
    res.status(500).json(err);
  }
};

// 🔹 OBTENER EMPLEADO POR ID
export const getEmpleadoById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("empleados")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    res.json(data);
  } catch (err) {
    console.error("ERROR GET BY ID:", err);
    res.status(500).json(err);
  }
};

// 🔹 OBTENER DATOS PARA CERTIFICADO
export const getCertificadoEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("empleados")
      .select("nombre, cargo, salario, fecha_ingreso")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    res.json(data);
  } catch (err) {
    console.error("ERROR CERTIFICADO:", err);
    res.status(500).json(err);
  }
};