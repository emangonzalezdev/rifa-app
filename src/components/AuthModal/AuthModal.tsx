// src/components/AuthModal/AuthModal.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '../../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { signInWithGoogle, setUpRecaptcha, signInWithPhone } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Modal } from 'react-bootstrap';
import './AuthModal.scss';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ show, onClose }) => {
  const { currentUser } = useAuth();
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Estado para alternar entre inicio de sesión y registro
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
  });
  const [resetEmailSent, setResetEmailSent] = useState(false); // Nuevo estado para controlar el envío del correo de restablecimiento

  useEffect(() => {
    if (currentUser) {
      // Si el usuario ya está autenticado, cerrar el modal
      onClose();
    }
  }, [currentUser, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        // Modo de registro
        const signInMethods = await fetchSignInMethodsForEmail(auth, formData.email);
        if (signInMethods.length > 0) {
          // El correo ya está registrado
          setError('Este correo electrónico ya está registrado. Por favor, inicia sesión.');
        } else {
          // Registrar y luego iniciar sesión
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
          );
          // Actualizar el perfil del usuario con el nombre
          await updateProfile(userCredential.user, {
            displayName: formData.nombre,
          });
          // Autenticación exitosa, cerrar el modal
          onClose();
        }
      } else {
        // Modo de inicio de sesión
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        // Autenticación exitosa, cerrar el modal
        onClose();
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este correo electrónico.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta. Por favor, inténtalo de nuevo.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error('Error al autenticar con Google:', error);
      setError('Error al autenticar con Google');
    }
  };

  const handlePhoneAuth = async () => {
    const phoneNumber = prompt('Ingresa tu número de teléfono (incluye el código de país):');
    if (!phoneNumber) return;

    const appVerifier = setUpRecaptcha('recaptcha-container');
    try {
      const confirmationResult = await signInWithPhone(phoneNumber, appVerifier);
      const verificationCode = prompt('Ingresa el código de verificación que recibiste:');
      if (verificationCode) {
        await confirmationResult.confirm(verificationCode);
        onClose();
      }
    } catch (error) {
      console.error('Error al autenticar con teléfono:', error);
      setError('Error al autenticar con teléfono');
    }
  };

  const handlePasswordReset = async () => {
    const email = prompt('Por favor, ingresa tu correo electrónico para restablecer la contraseña:');
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setError('');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este correo electrónico.');
      } else {
        setError('Error al enviar el correo de restablecimiento. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{isSignUp ? 'Registrarse' : 'Iniciar Sesión'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger">{error}</p>}
        {resetEmailSent && (
          <p className="text-success">
            Se ha enviado un correo para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.
          </p>
        )}
        <form onSubmit={handleEmailAuth}>
          {isSignUp && (
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button variant="primary" type="submit" className="mt-2">
            {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
          </Button>
        </form>
        {!isSignUp && (
          <div className="mt-2">
            <span
              className="forgot-password-link"
              onClick={handlePasswordReset}
              style={{ color: 'blue', cursor: 'pointer' }}
            >
              ¿Olvidaste tu contraseña?
            </span>
          </div>
        )}
        <hr />
        <Button variant="danger" onClick={handleGoogleAuth} className="mt-2">
          {isSignUp ? 'Registrarse' : 'Iniciar Sesión'} con Google
        </Button>
        <Button variant="success" onClick={handlePhoneAuth} className="mt-2">
          {isSignUp ? 'Registrarse' : 'Iniciar Sesión'} con Teléfono
        </Button>
        <div id="recaptcha-container"></div>
        <p className="mt-3">
          {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}{' '}
          <span
            className="toggle-auth-mode"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setFormData({ nombre: '', email: '', password: '' });
            }}
            style={{ color: 'blue', cursor: 'pointer' }}
          >
            {isSignUp ? 'Inicia sesión' : 'Regístrate'}
          </span>
        </p>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
