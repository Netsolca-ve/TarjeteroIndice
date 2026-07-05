import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import logoIVSS from '../assets/logo-ivss.png';
import logoivssb from '../assets/logo-ivssb.png';


export default function Login() {

document.body.style.margin = '0';
document.body.style.padding = '0';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor complete todos los campos.');
      return;
    }

    setLoading(true);
    // Simulación de autenticación 
    setTimeout(() => {
      if (email === 'hospital@gmail.com' && password === 'estadistica2026') {
        navigate('/dashboard');
      } else {
        setError('Credenciales incorrectas. Intente nuevamente.');
        setLoading(false);
      }
    }, 900);
  };

  return (
    <div style={styles.wrapper}>
      {/* Panel izquierdo decorativo */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <img
           src={logoivssb}
          alt="IVSS"
         style={styles.logo}
/>
          <h1 style={styles.leftTitle}>IVSS</h1>
          <p style={styles.leftSubtitle}>Instituto Venezolano de los Seguros Sociales</p>
          <div style={styles.dividerLine} />
          <p style={styles.leftCaption}>Sistema Integrado de Gestión de Historias Médicas</p>
          <div style={styles.leftBadges}>
            <span style={styles.badge}>Archivo Clínico</span>
            <span style={styles.badge}>Índice de Historias</span>
            <span style={styles.badge}>Acceso Institucional</span>
          </div>
        </div>
        <div style={styles.leftFooter}>
          <p style={styles.footerText}>
            © 2026{' '}
            <a 
              href="https://www.instagram.com/netsolca.ve" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.footerLink}
            >
              NETSOLCA
            </a>
            . Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <div style={styles.rightPanel}>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={styles.formCard}
        >
          <div style={styles.logoSmall}>
            <img src={logoIVSS} alt="IVSS" style={styles.logo} />
          </div>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Iniciar Sesión</h2>
            <p style={styles.formSubtitle}>
              Ingrese sus credenciales para acceder al sistema
            </p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.errorBox}
              >
                <FiAlertCircle style={{ marginRight: '8px', flexShrink: 0 }} />
                {error}
              </motion.div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Usuario (Correo Institucional)</label>
              <div style={styles.inputWrapper}>
                <FiMail style={styles.inputIcon} />
                <input
                  type="email"
                  style={styles.input}
                  placeholder=" usuario"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <div style={styles.inputWrapper}>
                <FiLock style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  style={{ ...styles.input, paddingRight: '44px' }}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div style={styles.forgotRow}>
              <a href="#" style={styles.forgotLink}>¿Olvidó su contraseña?</a>
            </div>

            <motion.button
              type="submit"
              style={styles.button}
              whileHover={{ backgroundColor: '#1e40af' }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.spinner} />
              ) : (
                'INICIAR SESIÓN'
              )}
            </motion.button>
          </form>

          <div style={styles.formFooter}>
            <p style={styles.securityNote}> Conexión segura • Acceso solo personal autorizado</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {

logo: {
  width: 'clamp(90px, 8vw, 130px)',
  height: 'clamp(90px, 8vw, 130px)',
  objectFit: 'contain'
},

logoSmallImg: {
  width: '60px',
  height: '60px',
  objectFit: 'contain'
},
wrapper: {
  display: 'flex',
  width: '100vw',
  height: '100vh',
  margin: 0,
  padding: 0,
  overflow: 'hidden',
  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
},
  // Panel izquierdo
 leftPanel: {
  flex: '0 0 38%',
  minWidth: '350px',
  maxWidth: '520px',
  background: 'linear-gradient(160deg, #0f2460 0%, #1e3a8a 50%, #1e40af 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '2.5rem',
  position: 'relative',
  overflow: 'hidden',
},
  leftContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '1rem',
    marginTop: '2rem',
  },
  leftLogo: { marginBottom: '0.5rem' },
leftTitle: {
  color: 'white',
  fontSize: 'clamp(2.5rem, 4vw, 4rem)',
  fontWeight: '800',
  margin: 0,
  letterSpacing: '6px',
},
leftSubtitle: {
  color: 'white',
  fontSize: '0.9rem',
  margin: 0,
  lineHeight: 1.5,
  maxWidth: '280px',
},
dividerLine: {
  width: '60px',
  height: '2px',
  background: 'rgba(255,255,255,0.4)',
  borderRadius: '2px',
  margin: '0.5rem 0',
},
leftCaption: {
  color: 'white',
  fontSize: '0.8rem',
  maxWidth: '260px',
  lineHeight: 1.6,
  margin: 0,
},
leftBadges: {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  justifyContent: 'center',
  marginTop: '1rem',
},
badge: {
  background: 'rgba(255,255,255,0.12)',
  color: 'white',
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '0.78rem',
  border: '1px solid rgba(255,255,255,0.2)',
},
leftFooter: { textAlign: 'center' },
footerText: { 
  color: 'white', 
  fontSize: '0.75rem', 
  margin: 0 
},
footerLink: {
  color: 'white',
  textDecoration: 'none',
  fontWeight: '700',
  transition: 'opacity 0.2s',
  '&:hover': {
    opacity: 0.7,
  },
},

  // Panel derecho
  rightPanel: {
    flex: 1,
    background: '#f0f4f8',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
  },
formCard: {
  background: 'white',
  borderRadius: '16px',
  padding: '2rem',
  width: '90%',
  maxWidth: '500px',
  minWidth: '350px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
},
  formHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoSmall: { display: 'flex', justifyContent: 'center', marginBottom: '1rem' },
  formTitle: {
    color: '#1e3a8a',
    fontSize: '1.6rem',
    fontWeight: '700',
    margin: '0 0 0.5rem 0',
  },
  formSubtitle: {
    color: '#64748b',
    fontSize: '0.85rem',
    margin: 0,
    lineHeight: 1.5,
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0' },
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
  inputGroup: { marginBottom: '1.2rem' },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.875rem',
  },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#9ca3af',
    fontSize: '1rem',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#111827',
    background: '#f9fafb',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  forgotRow: { textAlign: 'right', marginBottom: '1.5rem', marginTop: '-0.5rem' },
  forgotLink: { color: '#1e3a8a', fontSize: '0.8rem', textDecoration: 'none' },
  button: {
    width: '100%',
    padding: '13px',
    background: '#1e3a8a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '48px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  formFooter: { marginTop: '1.5rem', textAlign: 'center' },
  securityNote: { color: '#9ca3af', fontSize: '0.75rem', margin: 0 },
};