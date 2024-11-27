// src/pages/RaffleDetails/RaffleDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './RaffleDetails.scss';

interface Raffle {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: any;
  tipo: string;
  sorteo: boolean;
  cantidadDeNumeros: number;
  numerosSeleccionados: { [key: string]: any };
}

const RaffleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRaffle = async () => {
      if (!id) {
        setError('ID de rifa no válido');
        return;
      }

      try {
        const raffleRef = doc(db, 'rifas', id);
        const raffleSnap = await getDoc(raffleRef);

        if (raffleSnap.exists()) {
          setRaffle({ id: raffleSnap.id, ...raffleSnap.data() } as Raffle);
        } else {
          setError('La rifa no existe.');
        }
      } catch (err) {
        setError('Error al obtener los detalles de la rifa.');
      }
    };

    fetchRaffle();
  }, [id]);

  const shareUrl = `${window.location.origin}/raffle/${id}`;

  if (error) {
    return (
      <div className="container mt-5">
        <p>{error}</p>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="container mt-5">
        <p>Cargando detalles de la rifa...</p>
      </div>
    );
  }

  return (
    <div className="raffle-details container mt-5">
      <h2>{raffle.nombre}</h2>
      <p>{raffle.descripcion}</p>
      <p>Fecha: {raffle.fecha.toDate().toLocaleDateString()}</p>
      <p>Tipo: {raffle.tipo}</p>
      <p>Cantidad de Números: {raffle.cantidadDeNumeros}</p>
      <p>
        Enlace para compartir: <a href={shareUrl}>{shareUrl}</a>
      </p>
      <Link to={`/raffle/${raffle.id}/select-number`} className="btn btn-primary">
        Ver Números Disponibles
      </Link>
    </div>
  );
};

export default RaffleDetails;
