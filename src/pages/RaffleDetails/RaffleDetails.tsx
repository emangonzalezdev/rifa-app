// src/pages/RaffleDetails/RaffleDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './RaffleDetails.scss';
import { useAuth } from '../../contexts/AuthContext';

interface UserInfo {
  uid: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
}

interface Raffle {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: any;
  tipo: string;
  sorteo: boolean;
  cantidadDeNumeros: number;
  numerosSeleccionados: { [key: string]: UserInfo };
  creadorId: string;
}

const RaffleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

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
  // Verificar si el usuario actual es el creador de la rifa
  const isCreator = currentUser && raffle && currentUser.uid === raffle.creadorId;

  // Procesar los números seleccionados para agruparlos por usuario
  const usuariosConNumeros: { [key: string]: { userInfo: UserInfo; numeros: number[] } } = {};

  if (raffle?.numerosSeleccionados) {
    for (const [numero, userInfo] of Object.entries(raffle.numerosSeleccionados)) {
      const key = userInfo.uid;
      if (usuariosConNumeros[key]) {
        usuariosConNumeros[key].numeros.push(Number(numero));
      } else {
        usuariosConNumeros[key] = {
          userInfo,
          numeros: [Number(numero)],
        };
      }
    }
  }

  // Ordenar los usuarios por apellido (manejar casos donde apellido puede ser undefined)
  const usuariosOrdenados = Object.values(usuariosConNumeros).sort((a, b) => {
    const apellidoA = a.userInfo.apellido ? a.userInfo.apellido.toLowerCase() : '';
    const apellidoB = b.userInfo.apellido ? b.userInfo.apellido.toLowerCase() : '';
    if (apellidoA < apellidoB) return -1;
    if (apellidoA > apellidoB) return 1;
    return 0;
  });

  // Obtener los números disponibles
  const numerosTotales = Array.from({ length: raffle?.cantidadDeNumeros || 0 }, (_, i) => i + 1);
  const numerosSeleccionados = Object.keys(raffle?.numerosSeleccionados || {}).map(Number);
  const numerosDisponibles = numerosTotales.filter((numero) => !numerosSeleccionados.includes(numero));

  // Dividir los números disponibles en filas de 10 números
  const filasNumerosDisponibles: number[][] = [];
  for (let i = 0; i < numerosDisponibles.length; i += 10) {
    filasNumerosDisponibles.push(numerosDisponibles.slice(i, i + 10));
  }

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
        Enlace para compartir: <a href={`${shareUrl}/select-number`}>{shareUrl}</a>
      </p>
      <Link to={`/raffle/${raffle.id}/select-number`} className="btn btn-primary">
        Ver Números Disponibles
      </Link>
      {isCreator && (
        <div className="creator-section mt-5">
          <h3>Lista de Participantes</h3>
          {usuariosOrdenados.length > 0 ? (
            usuariosOrdenados.map(({ userInfo, numeros }) => (
              <div key={userInfo.uid} className="participant-info">
                <p>
                  {userInfo.apellido || 'Apellido desconocido'}, {userInfo.nombre || 'Nombre desconocido'} -{' '}
                  {userInfo.telefono || 'Teléfono no disponible'} - {userInfo.email || 'Email no disponible'}:
                </p>
                <p>
                  Número{numeros.length > 1 ? 's' : ''} elegido{numeros.length > 1 ? 's' : ''}:{' '}
                  {numeros.join(', ')}
                </p>
              </div>
            ))
          ) : (
            <p>No hay participantes aún.</p>
          )}

          <h3 className="mt-5">Números Disponibles</h3>
          {numerosDisponibles.length > 0 ? (
            <div className="available-numbers">
              {filasNumerosDisponibles.map((fila, index) => (
                <div key={index} className="number-row">
                  {fila.map((numero) => (
                    <span key={numero} className="available-number">
                      {numero}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p>No hay números disponibles.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RaffleDetails;
