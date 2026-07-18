import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiPrinter, FiUser, FiActivity,
  FiCheckCircle, FiHash, FiCreditCard, FiCalendar,
  FiEdit2, FiX, FiSave, FiAlertCircle
} from 'react-icons/fi';
import fondoHospital from '../assets/fondo-ivss.png';
import logoivssb from '../assets/logo-ivssb.png';
import { supabase } from '../services/supabase';
import logoIVSS from '../assets/logo-ivss.png';

const ESPECIALIDADES = ['OBSTETRICIA', 'GINECOLOGÍA', 'CIRUGÍA GENERAL', 'MEDICINA INTERNA', 'TRAUMATOLOGÍA', 'PEDIATRÍA', 'CARDIOLOGÍA', 'NEUROLOGÍA'];

export default function DetallePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [modalError, setModalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  
  useEffect(() => {
    if (isEditModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isEditModalOpen]);


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

  // =========================
  // IMPRIMIR 
  // =========================
  const handlePrint = () => {
    const logoURL = logoIVSS;

    const contenido = `
      <html>
        <head>
          <style>
            /* RESET */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              padding: 40px 30px;
              max-width: 800px;
              margin: 0 auto;
              color: #1e293b;
            }

            /* HEADER CON LOGO A LA DERECHA */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #1e3a8a;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }

            .header-left h1 {
              font-size: 20px;
              color: #1e3a8a;
              margin: 0;
              letter-spacing: 1px;
            }
            .header-left .sub {
              font-size: 13px;
              color: #475569;
              margin-top: 2px;
            }

            .logo-container {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .logo-container img {
              width: 70px;
              height: 70px;
              object-fit: contain;
            }

            /* TÍTULO */
            .titulo-impresion {
              text-align: center;
              font-size: 18px;
              font-weight: 700;
              color: #1e3a8a;
              margin-bottom: 24px;
              letter-spacing: 2px;
              text-transform: uppercase;
            }

            /* CUADRO DE DATOS */
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px 30px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 24px 28px;
            }

            .info-item {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .info-item.full {
              grid-column: span 2;
            }
            .info-item .label {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-item .value {
              font-size: 16px;
              font-weight: 600;
              color: #0f172a;
            }

            /* ESTADO */
            .estado-activo {
              color: #166534;
              background: #dcfce7;
              padding: 2px 12px;
              border-radius: 20px;
              display: inline-block;
              font-size: 14px;
            }
            .estado-inactivo {
              color: #92400e;
              background: #fef3c7;
              padding: 2px 12px;
              border-radius: 20px;
              display: inline-block;
              font-size: 14px;
            }

            /* FOOTER */
            .footer {
              margin-top: 32px;
              font-size: 11px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
            }
            .footer a {
              color: #1e3a8a;
              text-decoration: none;
              font-weight: 700;
            }

            @media print {
              body { padding: 30px 20px; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <!-- HEADER con logo a la derecha -->
          <div class="header">
            <div class="header-left">
              <h1>IVSS - Hospital Dr. Adolfo Pons</h1>
              <div class="sub">Sistema de Historias Medicas</div>
            </div>
            <div class="logo-container">
              <img src="${logoURL}" alt="IVSS Logo" />
            </div>
          </div>

          <!-- TÍTULO -->
          <div class="titulo-impresion"> Historias Medicas</div>

          <!-- DATOS DEL PACIENTE -->
          <div class="info-grid">
            <div class="info-item full">
              <span class="label">Nombres completos</span>
              <span class="value">${paciente.nombres} ${paciente.apellidos}</span>
            </div>

            <div class="info-item">
              <span class="label">Cedula</span>
              <span class="value">${paciente.cedula}</span>
            </div>

            <div class="info-item">
              <span class="label">Numero de Historia</span>
              <span class="value">${paciente.numero_historia}</span>
            </div>

            <div class="info-item">
              <span class="label">Especialidad</span>
              <span class="value">${paciente.especialidad}</span>
            </div>

            <div class="info-item">
              <span class="label">Fecha de Nacimiento</span>
              <span class="value">${paciente.fecha_nacimiento}</span>
            </div>

           
         
         <!-- FOOTER CENTRADO DENTRO DEL info-grid -->
  <div class="info-item full" style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 8px;">
    <span style="font-size: 11px; color: #94a3b8; display: block; width: 100%; text-align: center;">
      © 2026 NETSOLCA    Fecha de impresión: ${new Date().toLocaleDateString('es-VE')}
    </span>
  </div>
</div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(contenido);
    win.document.close();
  };

  
  const handleOpenEdit = () => {
    if (paciente) {
      setEditData({
        id_paciente: paciente.id_paciente,
        cedula: paciente.cedula,
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        fechaNac: paciente.fecha_nacimiento,
        especialidad: paciente.especialidad,
        historia: paciente.numero_historia,
        estado: paciente.estado
      });
      setIsEditModalOpen(true);
      setModalError('');
    }
  };

  // Guardar edición
  const handleGuardarEdicion = async () => {
    if (!editData?.id_paciente) {
      setModalError('Error: ID del paciente no encontrado');
      return;
    }

    // Validar campos
    if (!editData.nombres || !editData.apellidos || !editData.cedula || !editData.historia) {
      setModalError('Complete todos los campos obligatorios');
      return;
    }

    try {
      const cedulaLimpia = editData.cedula.replace(/\D/g, '');

      const { error } = await supabase
        .from('pacientes')
        .update({
          cedula: cedulaLimpia,
          nombres: editData.nombres.trim(),
          apellidos: editData.apellidos.trim(),
          fecha_nacimiento: editData.fechaNac,
          especialidad: editData.especialidad,
          numero_historia: editData.historia.trim(),
          estado: editData.estado
        })
        .eq('id_paciente', editData.id_paciente);

      if (error) throw error;

      // Actualizar los datos en la vista
      setPaciente({
        ...paciente,
        cedula: cedulaLimpia,
        nombres: editData.nombres.trim(),
        apellidos: editData.apellidos.trim(),
        fecha_nacimiento: editData.fechaNac,
        especialidad: editData.especialidad,
        numero_historia: editData.historia.trim(),
        estado: editData.estado
      });

      setIsEditModalOpen(false);
      setEditData(null);
      setModalError('');
      setSuccessMsg('Paciente actualizado correctamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error editando:', error);
      setModalError('Error al editar el paciente. Intente de nuevo.');
    }
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
      {/* TOAST SUCCESS */}
      {successMsg && (
        <div style={styles.toast}>
          <FiCheckCircle style={{ marginRight: '8px' }} /> {successMsg}
        </div>
      )}

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

          <div style={styles.headerButtons}>
            <button onClick={handleOpenEdit} style={styles.btnEditar}>
              <FiEdit2 style={{ marginRight: '8px' }} />
              Editar
            </button>
            <button onClick={handlePrint} style={styles.btnImprimir}>
              <FiPrinter style={{ marginRight: '8px' }} />
              Imprimir Historia
            </button>
          </div>
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
              icon: <FiCheckCircle color={paciente.estado === 'Activo' ? '#166534' : '#92400e'} />
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

      {/* MODAL EDITAR  */}
      {isEditModalOpen && editData && (
        <div style={styles.overlay}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={styles.modal}
          >
            <div style={styles.modalHeader}>
              <span>EDITAR DATOS DEL PACIENTE</span>
              <FiX style={{ cursor: 'pointer' }} onClick={() => {
                setIsEditModalOpen(false);
                setModalError('');
              }} />
            </div>
            <div style={styles.modalBody}>
              {modalError && (
                <div style={styles.errorBox}>
                  <FiAlertCircle style={{ marginRight: '8px' }} /> {modalError}
                </div>
              )}
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cédula <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    type="text"
                    style={styles.modalInput}
                    value={editData.cedula}
                    onChange={(e) => setEditData(prev => ({ ...prev, cedula: e.target.value }))}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Fecha de Nacimiento <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    type="date"
                    style={styles.modalInput}
                    value={editData.fechaNac}
                    onChange={(e) => setEditData(prev => ({ ...prev, fechaNac: e.target.value }))}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nombres <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    type="text"
                    style={styles.modalInput}
                    value={editData.nombres}
                    onChange={(e) => setEditData(prev => ({ ...prev, nombres: e.target.value }))}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Apellidos <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    type="text"
                    style={styles.modalInput}
                    value={editData.apellidos}
                    onChange={(e) => setEditData(prev => ({ ...prev, apellidos: e.target.value }))}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Especialidad <span style={{ color: '#dc2626' }}>*</span></label>
                  <select
                    style={styles.modalInput}
                    value={editData.especialidad}
                    onChange={(e) => setEditData(prev => ({ ...prev, especialidad: e.target.value }))}
                  >
                    {ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>N° de Historia <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    type="text"
                    style={styles.modalInput}
                    value={editData.historia}
                    onChange={(e) => setEditData(prev => ({ ...prev, historia: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ marginTop: '15px' }}>
                <label style={styles.label}>Estado</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                  {['Activo', 'Inactivo'].map(op => (
                    <label key={op} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="estado"
                        value={op}
                        checked={editData.estado === op}
                        onChange={e => setEditData(prev => ({ ...prev, estado: e.target.value }))}
                      />
                      {op}
                    </label>
                  ))}
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button style={styles.btnSave} onClick={handleGuardarEdicion}>
                  <FiSave style={{ marginRight: '6px' }} /> GUARDAR CAMBIOS
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
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
    backgroundAttachment: 'fixed',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    background: '#166534',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    fontSize: '0.9rem',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginBottom: '1.5rem',
    color: '#1e3a8a',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  card: {
    background: 'white',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    maxHeight: 'calc(100vh - 140px)',
    overflow: 'hidden',
  },
  headerCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '1.5rem',
    marginBottom: '2rem',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
  },
  title: {
    color: '#1e3a8a',
    margin: 0,
    fontSize: '1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px',
  },
  infoBox: {
    padding: '15px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  label: {
    color: '#64748b',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  value: {
    fontSize: '1.1rem',
    color: '#1e293b',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  btnImprimir: {
    background: '#1e3a8a',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  },
  btnEditar: {
    background: '#059669',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  },
  // Modal
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    width: '620px',
    maxWidth: '95vw',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    background: 'linear-gradient(90deg, #0f2460, #1e3a8a)',
    color: 'white',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '700',
    fontSize: '0.95rem',
    letterSpacing: '0.5px',
  },
  modalBody: {
    padding: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontWeight: '600',
    fontSize: '0.82rem',
    color: '#374151',
  },
  modalInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontSize: '0.9rem',
    background: '#f9fafb',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #f3f4f6',
  },
  btnSave: {
    background: '#1e3a8a',
    color: 'white',
    border: 'none',
    padding: '10px 22px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
  },
  errorBox: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
};