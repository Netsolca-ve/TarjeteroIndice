import React from 'react'; 
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEye, FiEdit2, FiPrinter, FiSearch, FiLogOut,
  FiUser, FiCalendar, FiCreditCard, FiActivity, FiHash, FiX,
  FiHome, FiUsers, FiAlertCircle, FiCheckCircle, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import fondoHospital from '../assets/fondo-ivss.png';
import logoivssb from '../assets/logo-ivssb.png';
import logoIVSS from '../assets/logo-ivss.png';
import { supabase } from '../services/supabase';

const ESPECIALIDADES = ['OBSTETRICIA', 'GINECOLOGÍA', 'CIRUGÍA GENERAL', 'MEDICINA INTERNA', 'TRAUMATOLOGÍA', 'PEDIATRÍA', 'CARDIOLOGÍA', 'NEUROLOGÍA'];
const ITEMS_POR_PAGINA = 5;
const CACHE_TIEMPO = 300000;

const emptyForm = {
  cedula: '',
  nombres: '',
  apellidos: '',
  fechaNac: '',
  especialidad: 'OBSTETRICIA',
  historia: '',
  estado: 'Activo'
};

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

// Validar cédula
const validarCedula = (cedula) => {
  const cedulaLimpia = cedula.replace(/\D/g, '');
  if (!cedulaLimpia || cedulaLimpia.length < 7) {
    return 'La cédula debe tener al menos 7 dígitos';
  }
  if (cedulaLimpia.length > 10) {
    return 'La cédula no puede tener más de 10 dígitos';
  }
  if (cedula !== cedulaLimpia) {
    return 'La cédula solo debe contener números';
  }
  return null;
};

// Validar nombres: 
const validarNombres = (texto) => {
  if (!texto || texto.trim() === '') {
    return 'Este campo es obligatorio';
  }
  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/;
  if (!soloLetras.test(texto)) {
    return 'Solo se permiten letras';
  }
  if (texto.length < 2) {
    return 'Debe tener al menos 2 caracteres';
  }
  return null;
};

// Validar apellidos: 
const validarApellidos = (texto) => {
  if (!texto || texto.trim() === '') {
    return 'Este campo es obligatorio';
  }
  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/;
  if (!soloLetras.test(texto)) {
    return 'Solo se permiten letras, espacios y guiones';
  }
  if (texto.length < 2) {
    return 'Debe tener al menos 2 caracteres';
  }
  return null;
};

// Validar número de historia
const validarHistoria = (texto) => {
  if (!texto || texto.trim() === '') {
    return 'El número de historia es obligatorio';
  }
  const soloNumerosGuiones = /^[0-9\-\.]+$/;
  if (!soloNumerosGuiones.test(texto)) {
    return 'Solo se permiten números';
  }
  if (texto.replace(/[^0-9]/g, '').length < 6) {
    return 'Debe tener al menos 6 dígitos';
  }
  return null;
};

// Validar todo el formulario
const validarFormulario = (data) => {
  const errores = {};

  const errorCedula = validarCedula(data.cedula);
  if (errorCedula) errores.cedula = errorCedula;

  const errorNombres = validarNombres(data.nombres);
  if (errorNombres) errores.nombres = errorNombres;

  const errorApellidos = validarApellidos(data.apellidos);
  if (errorApellidos) errores.apellidos = errorApellidos;

  const errorHistoria = validarHistoria(data.historia);
  if (errorHistoria) errores.historia = errorHistoria;

  return errores;
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cedulaBusqueda, setCedulaBusqueda] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [editData, setEditData] = useState(null);
  const [formError, setFormError] = useState('');
  const [modalError, setModalError] = useState('');
  const [pagina, setPagina] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState('');
  const [estadisticas, setEstadisticas] = useState({ activos: 0, inactivos: 0 });


  // CARGAR PACIENTES CON PAGINACIÓN EN SERVIDOR
  
  useEffect(() => {
    cargarPacientes(pagina);
    cargarEstadisticas();
  }, [pagina]);

  useEffect(() => {
  // Eliminar el margen por defecto del body
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflowX = 'hidden';
  document.documentElement.style.overflowX = 'hidden'; // 
  document.documentElement.style.overflowY = 'auto'; //
});

// =========================
// BLOQUEAR SCROLL
// =========================
useEffect(() => {
  if (isModalOpen || isEditModalOpen) {
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
}, [isModalOpen, isEditModalOpen]);


  const cargarPacientes = useCallback(async (paginaActual = 1) => {
    try {
      setCargando(true);
      setErrorGlobal('');
      
      const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
      const fin = inicio + ITEMS_POR_PAGINA - 1;
      
      const { data, error, count } = await supabase
        .from('pacientes')
        .select('*', { count: 'estimated' })
        .order('id_paciente', { ascending: false })
        .range(inicio, fin);

      if (error) throw error;

      setPacientes(data || []);
      setTotalPacientes(count || 0);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      setErrorGlobal('Error al cargar pacientes. Intente de nuevo.');
      setPacientes([]);
    } finally {
      setCargando(false);
    }
  }, []);

  // =========================
  // CARGAR ESTADÍSTICAS 
  // =========================
  const cargarEstadisticas = useCallback(async () => {
    try {
      const { count: activos } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'Activo');

      const { count: inactivos } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'Inactivo');

      setEstadisticas({
        activos: activos || 0,
        inactivos: inactivos || 0
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, []);

  // =========================
  // BUSCAR POR CÉDULA 
  // =========================
  const buscarPorCedula = useCallback(async (cedula, esEnter = false) => {
    const cedulaLimpia = cedula.replace(/\D/g, '');
    
    // Si el campo está vacío, recargar todos los pacientes
    if (!cedulaLimpia || cedulaLimpia.length === 0) {
      setFormError('');
      await cargarPacientes(pagina);
      return;
    }

    // Si tiene menos de 3 dígitos, no buscar (para no saturar)
    if (cedulaLimpia.length < 3) {
      setFormError('Ingrese al menos 3 dígitos para buscar');
      return;
    }

    try {
      setCargando(true);
      setFormError('');
      setErrorGlobal('');
      
      
      if (esEnter) {
        const { data, error } = await supabase
          .from('pacientes')
          .select('*')
          .eq('cedula', cedulaLimpia)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // Abrir detalle del paciente
          navigate(`/paciente/${data.numero_historia}`);
          setCedulaBusqueda('');
          setFormError('');
          setCargando(false);
          return;
        } else {
          setFormError('No se encontró ningún paciente con esa cédula');
          setPacientes([]);
          setTotalPacientes(0);
          setCargando(false);
          return;
        }
      }

      // SI NO ES ENTER: Búsqueda en tiempo real 
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .ilike('cedula', `${cedulaLimpia}%`)
        .order('id_paciente', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        setPacientes(data);
        setTotalPacientes(data.length);
        setFormError('');
      } else {
        setPacientes([]);
        setTotalPacientes(0);
        setFormError('No se encontraron pacientes con esa cédula');
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setErrorGlobal('Error en la búsqueda. Intente de nuevo.');
    } finally {
      setCargando(false);
    }
  }, [cargarPacientes, pagina, navigate]);

  // =========================
  // MEMOIZAR DATOS PARA RENDIMIENTO
  // =========================
  const pacientesMemo = useMemo(() => {
    return pacientes.map(p => ({
      ...p,
      nombreCompleto: `${p.nombres} ${p.apellidos}`
    }));
  }, [pacientes]);

  const totalPaginas = Math.ceil(totalPacientes / ITEMS_POR_PAGINA);

  // =========================
  // CAMBIAR PÁGINA
  // =========================
  const cambiarPagina = useCallback((nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    setPagina(nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPaginas]);

  // =========================
  // ABRIR EDIT
  // =========================
  const handleOpenEdit = useCallback((p) => {
    setEditData({
      id_paciente: p.id_paciente,
      cedula: p.cedula,
      nombres: p.nombres,
      apellidos: p.apellidos,
      fechaNac: p.fecha_nacimiento,
      especialidad: p.especialidad,
      historia: p.numero_historia,
      estado: p.estado
    });
    setIsEditModalOpen(true);
    setFormError('');
    setModalError('');
  }, []);

  // =========================
  // GUARDAR PACIENTE
  // =========================
  const handleGuardar = useCallback(async () => {
    // 1. Validar todos los campos
    const errores = validarFormulario(formData);
    if (Object.keys(errores).length > 0) {
      const primerError = Object.values(errores)[0];
      setModalError(primerError);
      return;
    }

    // 2. Validar que todos los campos estén llenos
    if (!formData.cedula || !formData.nombres || !formData.apellidos || !formData.historia) {
      setModalError('Complete todos los campos obligatorios.');
      return;
    }

    try {
      // 3. Limpiar cédula (solo números)
      const cedulaLimpia = formData.cedula.replace(/\D/g, '');

      // 4. Verificar si la cédula ya existe
      const { data: existe } = await supabase
        .from('pacientes')
        .select('id_paciente')
        .eq('cedula', cedulaLimpia)
        .maybeSingle();

      if (existe) {
        setModalError('Ya existe un paciente registrado con esa cédula');
        return;
      }

      // 5. Verificar si el número de historia ya existe
      const { data: existeHistoria } = await supabase
        .from('pacientes')
        .select('id_paciente')
        .eq('numero_historia', formData.historia.trim())
        .maybeSingle();

      if (existeHistoria) {
        setModalError('Ya existe un paciente con ese número de historia');
        return;
      }

      // 6. Insertar paciente
      const { error } = await supabase
        .from('pacientes')
        .insert([{
          cedula: cedulaLimpia,
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          fecha_nacimiento: formData.fechaNac,
          especialidad: formData.especialidad,
          numero_historia: formData.historia.trim(),
          estado: 'Activo'
        }]);

      if (error) throw error;

      setFormData(emptyForm);
      setIsModalOpen(false);
      setModalError('');
      showSuccess('Paciente registrado exitosamente.');
      await cargarPacientes(pagina);
      await cargarEstadisticas();
    } catch (error) {
      console.error('Error guardando:', error);
      setModalError('Error al guardar el paciente. Intente de nuevo.');
    }
  }, [formData, pagina, cargarPacientes, cargarEstadisticas]);

  // =========================
  // EDITAR PACIENTE
  // =========================
  const handleGuardarEdicion = useCallback(async () => {
    if (!editData?.id_paciente) {
      setModalError('Error: ID del paciente no encontrado');
      return;
    }

    // 1. Validar todos los campos
    const errores = validarFormulario(editData);
    if (Object.keys(errores).length > 0) {
      const primerError = Object.values(errores)[0];
      setModalError(primerError);
      return;
    }

    try {
      // 2. Limpiar cédula (solo números)
      const cedulaLimpia = editData.cedula.replace(/\D/g, '');

      // 3. Actualizar paciente
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

      setIsEditModalOpen(false);
      setEditData(null);
      setModalError('');
      showSuccess('Paciente actualizado correctamente.');
      await cargarPacientes(pagina);
      await cargarEstadisticas();
    } catch (error) {
      console.error('Error editando:', error);
      setModalError('Error al editar el paciente. Intente de nuevo.');
    }
  }, [editData, pagina, cargarPacientes, cargarEstadisticas]);

  const showSuccess = useCallback((msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }, []);

  // =========================
  // ESTADÍSTICAS
  // =========================
  const stats = useMemo(() => [
    { label: 'Total Pacientes', value: totalPacientes, icon: <FiUsers />, color: '#1e3a8a' },
    { label: 'Activos', value: estadisticas.activos, icon: <FiCheckCircle />, color: '#166534' },
    { label: 'Inactivos', value: estadisticas.inactivos, icon: <FiAlertCircle />, color: '#92400e' },
  ], [totalPacientes, estadisticas]);

  // =========================
  // IMPRIMIR HISTORIA
  // =========================
  const handlePrint = useCallback((p) => {
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

            /* FOOTER - CENTRADO */
            .footer {
              margin-top: 32px;
              text-align: center !important;
              font-size: 11px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
              width: 100%;
              display: block;
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
              <div class="sub">Sistema de Historias Médicas</div>
            </div>
            <div class="logo-container">
              <img src="${logoURL}" alt="IVSS Logo" />
            </div>
          </div>

          <!-- TÍTULO -->
          <div class="titulo-impresion"> Historias Médicas</div>

          <!-- DATOS DEL PACIENTE -->
          <div class="info-grid">
            <div class="info-item full">
              <span class="label">Nombres completos</span>
              <span class="value">${p.nombres} ${p.apellidos}</span>
            </div>

            <div class="info-item">
              <span class="label">Cédula</span>
              <span class="value">${p.cedula}</span>
            </div>

            <div class="info-item">
              <span class="label">Número de Historia</span>
              <span class="value">${p.numero_historia}</span>
            </div>

            <div class="info-item">
              <span class="label">Especialidad</span>
              <span class="value">${p.especialidad}</span>
            </div>

            <div class="info-item">
              <span class="label">Fecha de Nacimiento</span>
              <span class="value">${p.fecha_nacimiento}</span>
            </div>

            

          <!-- FOOTER - CENTRADO -->
          <div class="footer">
            © 2026 NETSOLCA    Fecha de impresión: ${new Date().toLocaleDateString('es-VE')}
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
  }, []);

  // =========================
  // COMPONENTES
  // =========================
  const FilaPaciente = useMemo(() => {
    return React.memo(({ paciente, index }) => (
      <motion.tr
        key={paciente.id_paciente}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: Math.min(index * 0.02, 0.5) }}
        style={styles.trBody}
        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={e => e.currentTarget.style.background = 'white'}
      >
        <td style={{ ...styles.td, fontWeight: '600', color: '#1e3a8a' }}>{paciente.numero_historia}</td>
        <td style={styles.td}>{paciente.nombres} {paciente.apellidos}</td>
        <td style={styles.td}>{paciente.cedula}</td>
        <td style={styles.td}><span style={styles.specialtyTag}>{paciente.especialidad}</span></td>
        <td style={styles.td}>
          <span style={paciente.estado === 'Activo' ? styles.badgeActive : styles.badgeInactive}>
            {paciente.estado === 'Activo' ? '● Activo' : '● Inactivo'}
          </span>
        </td>
        <td style={styles.td}>
          <div style={styles.actionsGroup}>
            <button style={styles.actionBtn} title="Ver perfil" onClick={() => navigate(`/paciente/${paciente.numero_historia}`)}>
              <FiEye />
            </button>
            <button style={{ ...styles.actionBtn, color: '#0369a1' }} title="Editar" onClick={() => handleOpenEdit(paciente)}>
              <FiEdit2 />
            </button>
            <button style={{ ...styles.actionBtn, color: '#059669' }} title="Imprimir" onClick={() => handlePrint(paciente)}>
              <FiPrinter />
            </button>
          </div>
        </td>
      </motion.tr>
    ));
  }, [navigate, handleOpenEdit, handlePrint]);

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={logoivssb} alt="IVSS" style={styles.headerLogo} />
          <div style={styles.headerBrandBlock}>
            <span style={styles.brand}>IVSS</span>
            <span style={styles.brandSub}>Hospital Dr. Adolfo Pons</span>
          </div>
        </div>
        <nav style={styles.nav}>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>
            <FiHome style={{ marginRight: '6px' }} /> Inicio
          </button>
          <div style={styles.navDivider} />
          <button style={styles.navBtnDanger} onClick={() => navigate('/login')}>
            <FiLogOut style={{ marginRight: '6px' }} /> Cerrar Sesión
          </button>
        </nav>
      </header>

      {/* TOAST SUCCESS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            style={styles.toast}
          >
            <FiCheckCircle style={{ marginRight: '8px' }} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={styles.contentWrapper}>
        {/* ERROR GLOBAL */}
        {errorGlobal && (
          <div style={styles.errorGlobal}>
            <FiAlertCircle style={{ marginRight: '8px' }} />
            {errorGlobal}
          </div>
        )}

        {/* STATS */}
        <div style={styles.statsRow}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              style={{ ...styles.statCard, borderTop: `4px solid ${s.color}` }}
            >
              <span style={{ ...styles.statIcon, color: s.color }}>{s.icon}</span>
              <div>
                <div style={styles.statValue}>{s.value.toLocaleString()}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* BÚSQUEDA */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={styles.card}>
          <h2 style={styles.cardTitle}>BÚSQUEDA Y GESTIÓN DE PACIENTES</h2>
          <div style={styles.searchRow}>
            <div style={styles.searchInputWrapper}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar por cédula..."
                style={styles.input}
                value={cedulaBusqueda}
                onChange={(e) => {
                  const valor = e.target.value;
                  setCedulaBusqueda(valor);
                  setFormError('');
                  // FILTRADO EN TIEMPO REAL 
                  buscarPorCedula(valor, false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // 
                    buscarPorCedula(cedulaBusqueda, true);
                  }
                }}
              />
              {cedulaBusqueda && (
                <button style={styles.clearBtn} onClick={() => {
                  setCedulaBusqueda('');
                  setFormError('');
                  cargarPacientes(pagina);
                }}>
                  <FiX />
                </button>
              )}
            </div>
            <div style={styles.searchButtons}>
              <button 
                style={styles.btnBuscar} 
                onClick={() => {
                  buscarPorCedula(cedulaBusqueda, true);
                }}
              >
                Buscar
              </button>
              <button style={styles.btnPrimary} onClick={() => { 
                setFormData(emptyForm); 
                setFormError(''); 
                setModalError('');
                setIsModalOpen(true); 
              }}>
                Registrar Nuevo Paciente
              </button>
            </div>
          </div>
          {formError && <p style={styles.errorText}>{formError}</p>}
        </motion.div>

        {/* TABLA */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={styles.card}>
          <div style={styles.tableHeader}>
            <h2 style={styles.cardTitle}>PACIENTES REGISTRADOS</h2>
            <span style={styles.totalRegistros}>
              {totalPacientes > 0 ? `Mostrando ${pacientes.length} de ${totalPacientes.toLocaleString()}` : 'Sin resultados'}
            </span>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  {['N° HISTORIA', 'NOMBRES Y APELLIDOS', 'CÉDULA', 'ESPECIALIDAD', 'ESTADO', 'ACCIONES'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pacientesMemo.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={styles.emptyCell}>
                      <FiUsers style={{ fontSize: '2rem', color: '#d1d5db', display: 'block', margin: '0 auto 8px' }} />
                      No se encontraron pacientes
                    </td>
                  </tr>
                ) : (
                  pacientesMemo.map((p, i) => <FilaPaciente key={p.id_paciente} paciente={p} index={i} />)
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div style={styles.pagination}>
              <button 
                style={{ ...styles.pageBtn, ...styles.pageBtnText }} 
                disabled={pagina === 1 || cargando} 
                onClick={() => cambiarPagina(pagina - 1)}
              >
                <FiChevronLeft style={{ marginRight: '4px' }} /> 
              </button>
              
              {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                let numPagina;
                if (totalPaginas <= 5) {
                  numPagina = i + 1;
                } else if (pagina <= 3) {
                  numPagina = i + 1;
                } else if (pagina >= totalPaginas - 2) {
                  numPagina = totalPaginas - 4 + i;
                } else {
                  numPagina = pagina - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    style={{ ...styles.pageBtn, ...(pagina === numPagina ? styles.pageBtnActive : {}) }}
                    onClick={() => cambiarPagina(numPagina)}
                    disabled={cargando}
                  >
                    {numPagina}
                  </button>
                );
              })}
              
              <button 
                style={{ ...styles.pageBtn, ...styles.pageBtnText }} 
                disabled={pagina === totalPaginas || cargando} 
                onClick={() => cambiarPagina(pagina + 1)}
              >
                <FiChevronRight style={{ marginLeft: '4px' }} />
              </button>
              <span style={styles.pageInfo}>
                Página {pagina} de {totalPaginas}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* MODAL REGISTRAR */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={styles.overlay}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={styles.modal}
            >
              <ModalForm
                title="REGISTRO DEL PACIENTE"
                data={formData}
                setData={setFormData}
                error={modalError}
                onClose={() => {
                  setIsModalOpen(false);
                  setModalError('');
                }}
                onSave={handleGuardar}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EDITAR */}
      <AnimatePresence>
        {isEditModalOpen && editData && (
          <div style={styles.overlay}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={styles.modal}
            >
              <ModalForm
                title="EDITAR DATOS DEL PACIENTE"
                data={editData}
                setData={setEditData}
                error={modalError}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setModalError('');
                }}
                onSave={handleGuardarEdicion}
                isEdit
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer style={styles.footer}>
        © <a 
          href="https://www.instagram.com/netsolca.ve" 
          target="_blank" 
          rel="noopener noreferrer"
          style={styles.footerLink}
        >
          NETSOLCA
        </a> 2026 |
        Todos los derechos reservados.
      </footer>
    </div>
  );
}

// ============================================
// COMPONENTE MODAL 
// ============================================
function ModalForm({ title, data, setData, error, onClose, onSave, isEdit }) {
  const ESPECIALIDADES = ['OBSTETRICIA', 'GINECOLOGÍA', 'CIRUGÍA GENERAL', 'MEDICINA INTERNA', 'TRAUMATOLOGÍA', 'PEDIATRÍA', 'CARDIOLOGÍA', 'NEUROLOGÍA'];
  
  const field = (key, label, icon, placeholder, type = 'text') => (
    <div style={styles.inputGroup}>
      <label style={styles.label}>{label} <span style={{ color: '#dc2626' }}>*</span></label>
      <div style={styles.inputIconWrapper}>
        <span style={styles.fieldIcon}>{icon}</span>
        <input
          type={type}
          style={styles.modalInput}
          placeholder={placeholder}
          value={data[key] || ''}
          onChange={e => setData(prev => ({ ...prev, [key]: e.target.value }))}
        />
      </div>
    </div>
  );

  return (
    <>
      <div style={styles.modalHeader}>
        <span>{title}</span>
        <FiX style={{ cursor: 'pointer' }} onClick={onClose} />
      </div>
      <div style={styles.modalBody}>
        {error && (
          <div style={styles.errorBox}>
            <FiAlertCircle style={{ marginRight: '8px' }} /> {error}
          </div>
        )}
        <div style={styles.formGrid}>
          {field('cedula', 'Cédula', <FiCreditCard />, 'V')}
          {field('fechaNac', 'Fecha de Nacimiento', <FiCalendar />, '', 'date')}
          {field('nombres', 'Nombres Completos', <FiUser />, '')} 
          {field('apellidos', 'Apellidos Completos', <FiUser />, '')}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Especialidad <span style={{ color: '#dc2626' }}>*</span></label>
            <div style={styles.inputIconWrapper}>
              <span style={styles.fieldIcon}><FiActivity /></span>
              <select
                style={styles.modalInput}
                value={data.especialidad}
                onChange={e => setData(prev => ({ ...prev, especialidad: e.target.value }))}
              >
                {ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          {field('historia', 'N° de Historia', <FiHash />, ' ')}
        </div>
        {isEdit && (
          <div style={{ marginTop: '15px' }}>
            <label style={styles.label}>Estado</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              {['Activo', 'Inactivo'].map(op => (
                <label key={op} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="radio"
                    name="estado"
                    value={op}
                    checked={data.estado === op}
                    onChange={e => setData(prev => ({ ...prev, estado: e.target.value }))}
                  />
                  {op}
                </label>
              ))}
            </div>
          </div>
        )}
        <div style={styles.modalFooter}>
          <button style={styles.btnCancel} onClick={onClose}>CANCELAR</button>
          <button style={styles.btnSave} onClick={onSave}>
            {isEdit ? 'GUARDAR CAMBIOS' : 'GUARDAR REGISTRO'}
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================
// ESTILOS 
// ============================================
const styles = {
  headerLogo: {
    width: '55px',
    height: '55px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
  },
  container: {
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100%',
    paddingBottom: '50px',
    backgroundImage: `linear-gradient(rgba(240, 245, 255, 0.88), rgba(240, 245, 255, 0.88)), url(${fondoHospital})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'block',
    margin: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  header: {
    background: 'linear-gradient(90deg, #0f2460 0%, #1e3a8a 60%, #1e40af 100%)',
    color: 'white',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '68px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  headerBrandBlock: { display: 'flex', flexDirection: 'column' },
  brand: { fontWeight: '800', fontSize: '1.25rem', letterSpacing: '2px' },
  brandSub: { fontSize: '0.72rem', opacity: 0.8, letterSpacing: '0.5px' },
  nav: { display: 'flex', alignItems: 'center', gap: '8px' },
  navBtn: {
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
  },
  navBtnDanger: {
    background: 'rgba(220,38,38,0.2)',
    color: 'white',
    border: '1px solid rgba(220,38,38,0.3)',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
  },
  navDivider: { width: '1px', height: '28px', background: 'rgba(255,255,255,0.25)' },
  toast: {
    position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
    background: '#166534', color: 'white', padding: '12px 20px',
    borderRadius: '8px', display: 'flex', alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)', fontSize: '0.9rem',
  },
  contentWrapper: { padding: '1.5rem 2rem' },
  errorGlobal: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '1.5rem' },
  statCard: {
    background: 'white', borderRadius: '10px', padding: '1.2rem 1.5rem',
    display: 'flex', alignItems: 'center', gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  statIcon: { fontSize: '1.8rem' },
  statValue: { fontSize: '1.8rem', fontWeight: '800', color: '#111827', lineHeight: 1 },
  statLabel: { fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' },
  card: {
    background: 'white', padding: '1.5rem', borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1.5rem',
  },
  cardTitle: { margin: '0 0 1rem 0', color: '#1e3a8a', fontSize: '1rem', fontWeight: '700', letterSpacing: '0.5px' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  totalRegistros: { fontSize: '0.85rem', color: '#6b7280' },
  searchRow: { 
    display: 'flex', 
    gap: '10px', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    flexWrap: 'wrap' 
  },
  searchInputWrapper: { 
    position: 'relative', 
    display: 'flex', 
    alignItems: 'center', 
    flex: 1, 
    maxWidth: '480px',
    minWidth: '200px',
  },
  searchButtons: {
    display: 'flex',
    gap: '10px',
    flexShrink: 0,
  },
  searchIcon: { position: 'absolute', left: '14px', color: '#9ca3af' },
  clearBtn: { position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' },
  input: {
    width: '100%', padding: '11px 40px', border: '1.5px solid #e5e7eb',
    borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box',
    outline: 'none', background: '#f9fafb',
  },
  btnBuscar: {
    background: '#1e3a8a', color: 'white', border: 'none',
    padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap',
  },
  errorText: { color: '#dc2626', fontSize: '0.85rem', marginTop: '8px' },
  loadingText: { color: '#1e3a8a', fontSize: '0.85rem', marginTop: '8px' },
  btnPrimary: {
    background: '#1e3a8a', color: 'white', border: 'none',
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap',
  },
  tableWrapper: {
    overflowX: 'auto',
    maxHeight: '400px',
    overflowY: 'auto',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  trHead: {
    background: '#f1f5f9',
    textAlign: 'left',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  th: { padding: '12px 14px', fontSize: '0.78rem', fontWeight: '700', color: '#374151', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  trBody: { borderBottom: '1px solid #f3f4f6', background: 'white', transition: 'background 0.15s' },
  td: { padding: '12px 14px', fontSize: '0.9rem', color: '#374151' },
  emptyCell: { padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' },
  badgeActive: { background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap' },
  badgeInactive: { background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap' },
  specialtyTag: { background: '#eff6ff', color: '#1e40af', padding: '3px 10px', borderRadius: '4px', fontSize: '0.78rem' },
  actionsGroup: { display: 'flex', gap: '4px' },
  actionBtn: {
    background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px',
    padding: '6px 8px', cursor: 'pointer', color: '#1e3a8a',
    display: 'flex', alignItems: 'center', fontSize: '0.9rem',
    transition: 'background 0.15s',
  },
  pagination: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' },
  pageBtn: { background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center' },
  pageBtnActive: { background: '#1e3a8a', color: 'white', borderColor: '#1e3a8a' },
  pageBtnText: {
    padding: '6px 14px',
    fontWeight: '600',
    gap: '4px',
  },
  pageInfo: { color: '#9ca3af', fontSize: '0.78rem', marginLeft: '8px' },

  // Modals
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: 'white', width: '620px', maxWidth: '95vw', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { background: 'linear-gradient(90deg, #0f2460, #1e3a8a)', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.5px' },
  modalBody: { padding: '24px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontWeight: '600', fontSize: '0.82rem', color: '#374151' },
  inputIconWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  fieldIcon: { position: 'absolute', left: '10px', color: '#9ca3af', fontSize: '0.95rem', display: 'flex', alignItems: 'center' },
  modalInput: { width: '100%', padding: '10px 10px 10px 34px', border: '1.5px solid #e5e7eb', borderRadius: '8px', boxSizing: 'border-box', fontSize: '0.9rem', background: '#f9fafb' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' },
  btnCancel: { background: '#9ca3af', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  btnSave: { background: '#1e3a8a', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  errorBox: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', marginBottom: '1rem' },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    background: '#0f2460',
    color: '#ffffff',
    textAlign: 'center',
    padding: '10px',
    fontSize: '0.8rem',
    fontWeight: '500',
    zIndex: 999,
    boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
  },
  footerLink: {
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '700',
    transition: 'opacity 0.2s',
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.7,
    },
  },
};