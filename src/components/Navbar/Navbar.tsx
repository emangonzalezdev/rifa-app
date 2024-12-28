// src/components/navbar/Navbar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import AuthModal from '../AuthModal/AuthModal';

const Navbar: React.FC = () => {
  const { currentUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">
        Ri-FA
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav" // Asegúrate de que este ID coincide con el de la sección de enlaces
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ml-auto">
          {/* Enlaces comunes a todos los usuarios */}
          <li className="nav-item">
            <Link className="nav-link" to="/">
              Inicio
            </Link>
          </li>

          {currentUser ? (
            <>
              {/* Enlaces para usuarios autenticados */}
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Admin
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/create-raffle">
                  Crear Rifa
                </Link>
              </li>
              <li className="nav-item">
                {/* Usamos un ID de rifa de ejemplo para testing */}
                <Link className="nav-link" to="/raffle/testRaffleId">
                  Detalles de Rifa
                </Link>
              </li>
              <li className="nav-item">
                {/* Usamos un ID de rifa de ejemplo para testing */}
                <Link className="nav-link" to="/raffle/testRaffleId/select-number">
                  Elegir Número
                </Link>
              </li>
              <li className="nav-item">
                <span className="nav-link">Hola, {currentUser.displayName}</span>
              </li>
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <>
              {/* Enlaces para usuarios no autenticados */}
              <li className="nav-item">
                <span
                  className="nav-link"
                  onClick={() => setShowAuthModal(true)}
                  style={{ cursor: 'pointer' }}
                >
                  Iniciar Sesión / Registrarse
                </span>
              </li>
            </>
          )}
        </ul>
      </div>
      {/* Modal de autenticación */}
      <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </nav>
  );
};

export default Navbar;
