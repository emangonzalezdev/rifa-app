// src/components/ParticipatedRaffles/ParticipatedRaffles.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

interface Raffle {
  id: string;
  nombre: string;
  numerosSeleccionados: { [key: string]: any };
  // otros campos...
}

const ParticipatedRaffles: React.FC = () => {
  const [participatedRaffles, setParticipatedRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const fetchParticipatedRaffles = async () => {
      const rafflesRef = collection(db, 'rifas');
      const querySnapshot = await getDocs(rafflesRef);
      const raffles: Raffle[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Raffle;
        const numerosSeleccionados = data.numerosSeleccionados || {};
        const userParticipated = Object.values(numerosSeleccionados).some(
          (userInfo: any) => userInfo.uid === currentUser.uid
        );
        if (userParticipated) {
          raffles.push({ ...data, id: doc.id });
        }
      });
      setParticipatedRaffles(raffles);
      // Esperar 2 segundos antes de cambiar el estado de loading
      setTimeout(() => setLoading(false), 500);
    };

    fetchParticipatedRaffles();
  }, [currentUser]);

  return (
    <div>
      <h3>Rifas en las que Participas</h3>
      {loading ? (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      ) : participatedRaffles.length > 0 ? (
        participatedRaffles.map((raffle) => (
          <div key={raffle.id}>
            <Link to={`/raffle/${raffle.id}`}>{raffle.nombre}</Link>
          </div>
        ))
      ) : (
        <p>No estás participando en ninguna rifa.</p>
      )}
    </div>
  );
};

export default ParticipatedRaffles;
