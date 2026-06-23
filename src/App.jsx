import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dashboard'; // Asegúrate de que el nombre coincida con tu archivo
import DetallePaciente from './pages/DetallePaciente';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/paciente/:id" element={<DetallePaciente />} />
      </Routes>
    </Router>
  );
}