import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Admin.scss';

interface Raffle {
  id: string;
  nombre: string;
  numerosSeleccionados: { [key: string]: any };
  // otros campos...
}

const Admin: React.FC = () => {
  const [createdRaffles, setCreatedRaffles] = useState<Raffle[]>([]);
  const [participatedRaffles, setParticipatedRaffles] = useState<Raffle[]>([]);
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
    };

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
    };

    fetchCreatedRaffles();
    fetchParticipatedRaffles();
  }, [currentUser]);

  return (
    <div className="admin container">
      <h2>Panel de Administración 🛠️</h2>
      <h3>Tus Rifas Creadas</h3>
      {createdRaffles.length > 0 ? (
        createdRaffles.map((raffle) => (
          <div key={raffle.id}>
            <Link to={`/raffle/${raffle.id}`}>{raffle.nombre}</Link>
          </div>
        ))
      ) : (
        <p>No has creado ninguna rifa.</p>
      )}

      <h3>Rifas en las que Participas</h3>
      {participatedRaffles.length > 0 ? (
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

export default Admin;
