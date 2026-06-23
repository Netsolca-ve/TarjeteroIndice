import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiPrinter, FiUser, FiActivity,
  FiCheckCircle, FiHash, FiCreditCard, FiCalendar
} from 'react-icons/fi';
import fondoHospital from '../assets/fondo-ivss.png';
import { supabase } from '../services/supabase';

export default function DetallePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState(null);

  //  Cargar paciente desde Supabase
  useEffect(() => {
    const fetchPaciente = async () => {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('numero_historia', id)
        .single();

      if (!error) {
        setPaciente(data);
      }
    };

    fetchPaciente();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  // loading simple
  if (!paciente) {
    return (
      <div style={{ padding: '2rem' }}>
        Cargando paciente...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.pageContainer}
    >
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        <FiArrowLeft /> Volver al Inicio
      </button>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={styles.card}
      >
        <div style={styles.headerCard}>
          <h2 style={styles.title}>
            <FiUser style={{ marginRight: '10px' }} />
            Perfil del Paciente
          </h2>

          <button onClick={handlePrint} style={styles.btnImprimir}>
            <FiPrinter style={{ marginRight: '8px' }} />
            Imprimir Historia
          </button>
        </div>

        <div style={styles.grid}>
          {[
            {
              label: 'Nombres completos',
              val: `${paciente.nombres} ${paciente.apellidos}`,
              icon: <FiUser />
            },
            {
              label: 'Cédula',
              val: paciente.cedula,
              icon: <FiCreditCard />
            },
            {
              label: 'Número de Historia',
              val: paciente.numero_historia,
              icon: <FiHash />
            },
            {
              label: 'Estado',
              val: paciente.estado,
              icon: <FiCheckCircle color="#166534" />
            },
            {
              label: 'Especialidad',
              val: paciente.especialidad,
              icon: <FiActivity />
            },
            {
              label: 'Fecha de Nacimiento',
              val: paciente.fecha_nacimiento,
              icon: <FiCalendar />
            }
          ].map((item, index) => (
            <div key={index} style={styles.infoBox}>
              <small style={styles.label}>{item.label}</small>
              <div style={styles.value}>
                {item.icon}
                <span style={{ marginLeft: '8px' }}>{item.val}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

const styles = {
  pageContainer: {
    padding: '2rem',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${fondoHospital})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '1.5rem', color: '#1e3a8a', fontWeight: 'bold', fontSize: '1rem' },
  card: { background: 'white', maxWidth: '800px', margin: '0 auto', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  headerCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '1.5rem', marginBottom: '2rem' },
  title: { color: '#1e3a8a', margin: 0, fontSize: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
  infoBox: { padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  label: { color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' },
  value: { fontSize: '1.1rem', color: '#1e293b', marginTop: '8px', display: 'flex', alignItems: 'center' },
  btnImprimir: { background: '#1e3a8a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center' }
};