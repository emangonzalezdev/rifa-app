// src/pages/Home/Home.tsx
import React from 'react';
import { Button } from 'react-bootstrap';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithGoogle, setUpRecaptcha, signInWithPhone } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleEmailSignIn = () => {
    navigate('/login');
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
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
      }
    } catch (error) {
      console.error('Error al iniciar sesión con teléfono:', error);
    }
  };

  const testFirebaseConnection = async () => {
    try {
      // Por ejemplo, obtener un documento de prueba
      const docRef = doc(db, 'test', 'testDoc');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('Datos del documento:', docSnap.data());
        alert('Conexión exitosa con Firebase');
      } else {
        console.log('No se encontró el documento');
        alert('Conexión establecida, pero no se encontró el documento');
      }
    } catch (error) {
      console.error('Error al conectar con Firebase:', error);
      alert('Error al conectar con Firebase');
    }
  };

  return (
    <div className="home">
      {currentUser ? (
        <h1>🎉 Bienvenido, {currentUser.displayName || currentUser.email || currentUser.phoneNumber}! 🎉</h1>
      ) : (
        <h1>🎉 Bienvenido a Ri-FA! 🎉</h1>
      )}
      {!currentUser && (
        <div>
          <Button variant="primary" onClick={handleEmailSignIn}>
            Iniciar Sesión con Email
          </Button>
          <Button variant="danger" onClick={handleGoogleSignIn}>
            Iniciar Sesión con Google
          </Button>
          <Button variant="success" onClick={handlePhoneSignIn}>
            Iniciar Sesión con Teléfono
          </Button>
          <div id="recaptcha-container"></div>
        </div>
      )}
      <Button variant="primary" onClick={testFirebaseConnection}>
        Probar Conexión con Firebase
      </Button>
      {/* Otros elementos */}
    </div>
  );
};

export default Home;
