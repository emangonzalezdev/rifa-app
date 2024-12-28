// src/pages/Admin/Admin.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import './Admin.scss';

interface Raffle {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: any;
  tipo: string;
  sorteo: boolean;
  cantidadDeNumeros: number;
  numerosSeleccionados: { [key: string]: any };
  creadorId: string;
  // otros campos adicionales si los tienes
}

const Admin: React.FC = () => {
  const [createdRaffles, setCreatedRaffles] = useState<Raffle[]>([]);
  const [participatedRaffles, setParticipatedRaffles] = useState<Raffle[]>([]);
  const [loadingCreated, setLoadingCreated] = useState(true);
  const [loadingParticipated, setLoadingParticipated] = useState(true);
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
      setTimeout(() => setLoadingCreated(false), 2000);
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
      // Esperar 2 segundos antes de cambiar el estado de loading
      setTimeout(() => setLoadingParticipated(false), 2000);
    };

    fetchCreatedRaffles();
    fetchParticipatedRaffles();
  }, [currentUser]);

  return (
    <div className="admin container">
      <h2>Panel de Administración 🛠️</h2>

      <h3>Tus Rifas Creadas</h3>
      {loadingCreated ? (
        <div className="text-center my-3">
          <Spinner animation="border" role="status" />
        </div>
      ) : createdRaffles.length > 0 ? (
        createdRaffles.map((raffle) => (
          <div key={raffle.id} className="raffle-card">
            <Link to={`/raffle/${raffle.id}`}>
              <h4>{raffle.nombre}</h4>
            </Link>
            <p>{raffle.descripcion}</p>
            <p>
              Fecha: {raffle.fecha?.toDate().toLocaleDateString()} - Tipo: {raffle.tipo}
            </p>
            <p>Cantidad de Números: {raffle.cantidadDeNumeros}</p>
            {/* Puedes agregar más detalles aquí */}
          </div>
        ))
      ) : (
        <p>No has creado ninguna rifa.</p>
      )}

      <h3>Rifas en las que Participas</h3>
      {loadingParticipated ? (
        <div className="text-center my-3">
          <Spinner animation="border" role="status" />
        </div>
      ) : participatedRaffles.length > 0 ? (
        participatedRaffles.map((raffle) => (
          <div key={raffle.id} className="raffle-card">
            <Link to={`/raffle/${raffle.id}`}>
              <h4>{raffle.nombre}</h4>
            </Link>
            <p>{raffle.descripcion}</p>
            <p>
              Fecha: {raffle.fecha?.toDate().toLocaleDateString()} - Tipo: {raffle.tipo}
            </p>
            <p>Cantidad de Números: {raffle.cantidadDeNumeros}</p>
            {/* Puedes agregar más detalles aquí */}
          </div>
        ))
      ) : (
        <p>No estás participando en ninguna rifa.</p>
      )}
    </div>
  );
};

export default Admin;
