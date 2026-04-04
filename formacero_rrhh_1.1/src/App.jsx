import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  Dashboard,
  RegistrarEmpleados,
  Nomina,
  Vacaciones,
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

import './layout.css';

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔥 LOGIN COMO PANTALLA INICIAL */}
        <Route path="/" element={<Login />} />

        {/* 🔥 DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 🔹 RESTO DEL SISTEMA */}
        <Route path="/registrar-empleados" element={<RegistrarEmpleados />} />
        <Route path="/nomina" element={<Nomina />} />
        <Route path="/vacaciones" element={<Vacaciones />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/organizacion" element={<Organizacion />} />
        <Route path="/informacion-empleados" element={<InformacionEmpleados />} />
        <Route path="/lista-exempleados" element={<ListaExempleados />} />
        <Route path="/certificado-laboral" element={<CertificadoLaboral />} />

        {/* 🔹 DETALLE EMPLEADO */}
        <Route path="/empleado/:id" element={<EmpleadoDetalle />} />

        {/* 🔥 CUALQUIER RUTA → LOGIN */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;