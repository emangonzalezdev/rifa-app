// src/pages/EligeNumero.tsx
import React from 'react';
import Confetti from 'react-confetti';

const EligeNumero: React.FC = () => {
  return (
    <div id="eleginumero-page" className="container mt-5">
      <Confetti />
      <h1>Elige un Número</h1>
      <p>Selecciona tu número de la suerte.</p>
    </div>
  );
};

export default EligeNumero;
