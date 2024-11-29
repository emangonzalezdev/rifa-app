// src/pages/SelectNumber/SelectNumber.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './SelectNumber.scss';
import { useAuth } from '../../contexts/AuthContext';
import { signInWithGoogle, setUpRecaptcha, signInWithPhone } from '../../services/firebase';
import { Button } from 'react-bootstrap';

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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showLoginOptions, setShowLoginOptions] = useState(false);

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

  useEffect(() => {
    if (currentUser && showLoginOptions) {
      // El usuario acaba de iniciar sesión
      setShowLoginOptions(false);
      setIsModalOpen(true);
    }
  }, [currentUser, showLoginOptions]);

  const totalPages = raffle ? Math.ceil(raffle.cantidadDeNumeros / numbersPerPage) : 0;

  const handleNumberClick = (number: number) => {
    setSelectedNumber(number);
    if (currentUser) {
      // Usuario autenticado, mostrar confirmación
      setIsModalOpen(true);
    } else {
      // Usuario no autenticado, mostrar opciones de login
      setShowLoginOptions(true);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Funciones para iniciar sesión
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

  const handleConfirmSelection = async () => {
    if (!raffle || selectedNumber === null || !currentUser) return;

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
            [`numerosSeleccionados.${numKey}`]: {
              uid: currentUser.uid,
              nombre: currentUser.displayName || '',
              email: currentUser.email || '',
              telefono: currentUser.phoneNumber || '',
            },
          });
          alert(`¡Elegiste el número ${selectedNumber} con éxito!`);
          setIsModalOpen(false);
          // Actualizar el estado local
          setRaffle((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              numerosSeleccionados: {
                ...prev.numerosSeleccionados,
                [numKey]: {
                  uid: currentUser.uid,
                  nombre: currentUser.displayName || '',
                  email: currentUser.email || '',
                  telefono: currentUser.phoneNumber || '',
                },
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

      {/* Modal para usuarios autenticados */}
      {isModalOpen && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              ¡Buenísima elección, {currentUser.displayName || currentUser.email || currentUser.phoneNumber}!
            </h3>
            <p>¿Quieres elegir el número {selectedNumber}?</p>
            <button className="btn btn-primary" onClick={handleConfirmSelection}>
              Confirmar
            </button>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal para usuarios no autenticados */}
      {showLoginOptions && !currentUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Por favor, debes loguearte / registrarte</h3>
            <p>Antes de elegir el número {selectedNumber}, inicia sesión o regístrate:</p>
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
            <button className="btn btn-secondary" onClick={() => setShowLoginOptions(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectNumber;
