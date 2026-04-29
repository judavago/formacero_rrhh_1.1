import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  Dashboard,
  RegistrarEmpleados,
  Nomina,
  Reportes,
  Organizacion,
  InformacionEmpleados,
  ListaExempleados,
  CertificadoLaboral,
} from "./pages/pages.jsx";

// 🔹 Import detalle empleado
import EmpleadoDetalle from "./pages/empleado-detalle/empleado-detalle.jsx";

// 🔹 IMPORT LOGIN (NUEVO)
import Login from "./pages/login/login.jsx";

// 🔹 IMPORT FORGOT PASSWORD
import ForgotPassword from "./pages/forgot-password/forgot-password.jsx";
import ResetPassword from "./pages/reset-password/reset-password.jsx";

import './layout.css';

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!token || user?.rol !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔥 LOGIN COMO PANTALLA INICIAL */}
        <Route path="/" element={<Login />} />

        {/* � FORGOT PASSWORD */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* �🔥 DASHBOARD */}
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />

        {/* 🔹 RESTO DEL SISTEMA */}
        <Route path="/registrar-empleados" element={<RequireAuth><RequireAdmin><RegistrarEmpleados /></RequireAdmin></RequireAuth>} />
        <Route path="/nomina" element={<RequireAuth><RequireAdmin><Nomina /></RequireAdmin></RequireAuth>} />
        <Route path="/reportes" element={<RequireAuth><RequireAdmin><Reportes /></RequireAdmin></RequireAuth>} />
        <Route path="/organizacion" element={<RequireAuth><Organizacion /></RequireAuth>} />
        <Route path="/informacion-empleados" element={<RequireAuth><RequireAdmin><InformacionEmpleados /></RequireAdmin></RequireAuth>} />
        <Route path="/lista-exempleados" element={<RequireAuth><RequireAdmin><ListaExempleados /></RequireAdmin></RequireAuth>} />
        <Route path="/certificado-laboral" element={<RequireAuth><CertificadoLaboral /></RequireAuth>} />

        {/* 🔹 DETALLE EMPLEADO */}
        <Route path="/empleado/:id" element={<RequireAuth><EmpleadoDetalle /></RequireAuth>} />

        {/* 🔥 CUALQUIER RUTA → LOGIN */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;