import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

const API = "http://localhost:3001/api";

function Login() {

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 🔥 SI YA HAY TOKEN → NO DEJAR ENTRAR AL LOGIN
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ correo, password })
      });

      const data = await res.json();

      // 🔥 VALIDACIÓN
      if (!res.ok) {
        setError(data.message || "Credenciales incorrectas ❌");
        return;
      }

      // 🔐 VALIDACIÓN EXTRA (evita bugs silenciosos)
      if (!data.token || !data.user) {
        setError("Respuesta inválida del servidor ❌");
        return;
      }

      // 🔐 GUARDAR TOKEN
      localStorage.setItem("token", data.token);

      // 🔐 GUARDAR USUARIO (normalizado)
      localStorage.setItem("user", JSON.stringify({
        id: data.user.empleado_id,
        rol: data.user.rol,
        nombre: data.user.nombre
      }));

      // 🔥 REDIRECCIÓN SEGURA
      navigate("/dashboard");

    } catch (err) {
      console.error("ERROR LOGIN:", err);
      setError("No se pudo conectar con el servidor ❌");
    }
  };

  return (

    <div className="login-container">

      <form className="login-box" onSubmit={handleLogin}>

        <h2>Iniciar Sesión</h2>

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Ingresar</button>

      </form>

    </div>

  );
}

export default Login;