// src/pages/Register/Register.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '../../services/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Register.scss';
import { Button } from 'react-bootstrap';
import { signInWithGoogle, setUpRecaptcha, signInWithPhone } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      // Si el usuario ya está autenticado, redirigir al dashboard o página de inicio
      navigate('/admin');
    }
  }, [currentUser, navigate]);

  const handleEmailRegister = () => {
    navigate('/email-register');
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Usuario autenticado con Google
      navigate('/admin');
    } catch (error) {
      console.error('Error al registrarse con Google:', error);
      setError('Error al registrarse con Google');
    }
  };

  const handlePhoneSignIn = async () => {
    const phoneNumber = prompt('Ingresa tu número de teléfono (incluye el código de país):');
    if (!phoneNumber) return;

    const appVerifier = setUpRecaptcha('recaptcha-container');
    try {
      const confirmationResult = await signInWithPhone(phoneNumber, appVerifier);
      const verificationCode = prompt('Ingresa el código de verificación que recibiste:');
      if (verificationCode) {
        await confirmationResult.confirm(verificationCode);
        // Usuario autenticado con teléfono
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error al registrarse con teléfono:', error);
      setError('Error al registrarse con teléfono');
    }
  };

  return (
    <div className="register container">
      <h2>Registrarse 📝</h2>
      {error && <p className="text-danger">{error}</p>}
      <div className="register-buttons">
        <Button variant="primary" onClick={handleEmailRegister}>
          Registrarse con Email
        </Button>
        <Button variant="danger" onClick={handleGoogleSignIn}>
          Registrarse con Google
        </Button>
        <Button variant="success" onClick={handlePhoneSignIn}>
          Registrarse con Teléfono
        </Button>
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default Register;
