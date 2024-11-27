// src/pages/Home/Home.tsx
import React from 'react';
import { Button } from 'react-bootstrap';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Home: React.FC = () => {
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
      <h1>🎉 Bienvenido a Ri-FA! 🎉</h1>
      <Button variant="primary" onClick={testFirebaseConnection}>
        Probar Conexión con Firebase
      </Button>
      {/* Otros elementos */}
    </div>
  );
};

export default Home;
