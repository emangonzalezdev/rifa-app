// src/pages/SelectNumber/SelectNumber.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './SelectNumber.scss';

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

const SelectNumber: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [error, setError] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const numbersPerPage = 50;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ nombre: '', apellido: '', email: '', telefono: '' });

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

  const totalPages = raffle ? Math.ceil(raffle.cantidadDeNumeros / numbersPerPage) : 0;

  const handleNumberClick = (number: number) => {
    setSelectedNumber(number);
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleConfirmSelection = async () => {
    if (!raffle || selectedNumber === null) return;

    try {
      // Verificar si el número sigue disponible
      const raffleRef = doc(db, 'rifas', raffle.id);
      const raffleSnap = await getDoc(raffleRef);

      if (raffleSnap.exists()) {
        const updatedRaffle = { id: raffleSnap.id, ...raffleSnap.data() } as Raffle;
        const numKey = selectedNumber.toString();

        if (updatedRaffle.numerosSeleccionados && updatedRaffle.numerosSeleccionados[numKey]) {
          alert('Lo siento, el número ya ha sido tomado.');
          setIsModalOpen(false);
          return;
        } else {
          // Marcar el número como tomado y guardar la información del usuario
          await updateDoc(raffleRef, {
            [`numerosSeleccionados.${numKey}`]: userInfo,
          });
          alert(`¡Número ${selectedNumber} seleccionado con éxito!`);
          setIsModalOpen(false);
          // Actualizar el estado local
          setRaffle((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              numerosSeleccionados: {
                ...prev.numerosSeleccionados,
                [numKey]: userInfo,
              },
            };
          });
        }
      } else {
        alert('Error al actualizar la rifa.');
      }
    } catch (error) {
      alert('Error al seleccionar el número.');
    }
  };

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

  // Obtener los números para la página actual
  const numbers = [];
  const startNumber = (page - 1) * numbersPerPage + 1;
  const endNumber = Math.min(startNumber + numbersPerPage - 1, raffle.cantidadDeNumeros);

  for (let i = startNumber; i <= endNumber; i++) {
    numbers.push(i);
  }

  return (
    <div className="select-number container mt-5">
      <h2>Selecciona un Número</h2>
      <div className="numbers-container">
        {numbers.map((number) => {
          const numKey = number.toString();
          const isTaken = raffle.numerosSeleccionados && raffle.numerosSeleccionados[numKey];
          return (
            <button
              key={number}
              className={`number-button ${isTaken ? 'taken' : 'available'}`}
              onClick={() => !isTaken && handleNumberClick(number)}
              disabled={isTaken}
            >
              {number}
            </button>
          );
        })}
      </div>
      <div className="pagination">
        <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
          Siguiente
        </button>
      </div>

      {/* Modal para confirmar la selección */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>¿Quieres elegir el número {selectedNumber}?</h3>
            <p>Por favor, introduce tus datos:</p>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={userInfo.nombre}
              onChange={handleUserInfoChange}
              required
            />
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={userInfo.apellido}
              onChange={handleUserInfoChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Correo Electrónico"
              value={userInfo.email}
              onChange={handleUserInfoChange}
              required
            />
            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              value={userInfo.telefono}
              onChange={handleUserInfoChange}
              required
            />
            <button className="btn btn-primary" onClick={handleConfirmSelection}>
              Confirmar
            </button>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectNumber;
