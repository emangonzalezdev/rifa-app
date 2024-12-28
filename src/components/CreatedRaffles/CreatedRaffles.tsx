// src/components/CreatedRaffles/CreatedRaffles.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

interface Raffle {
  id: string;
  nombre: string;
  numerosSeleccionados: { [key: string]: any };
  // otros campos...
}

const CreatedRaffles: React.FC = () => {
  const [createdRaffles, setCreatedRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const fetchCreatedRaffles = async () => {
      const q = query(collection(db, 'rifas'), where('creadorId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const raffles: Raffle[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Raffle[];
      setCreatedRaffles(raffles);
      // Esperar 2 segundos antes de cambiar el estado de loading
      setTimeout(() => setLoading(false), 500);
    };

    fetchCreatedRaffles();
  }, [currentUser]);

  return (
    <div>
      <h3>Tus Rifas Creadas</h3>
      {loading ? (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      ) : createdRaffles.length > 0 ? (
        createdRaffles.map((raffle) => (
          <div key={raffle.id}>
            <Link to={`/raffle/${raffle.id}`}>{raffle.nombre}</Link>
          </div>
        ))
      ) : (
        <p>No has creado ninguna rifa.</p>
      )}
    </div>
  );
};

export default CreatedRaffles;
