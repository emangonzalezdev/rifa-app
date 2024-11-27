import React, { useState } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './CreateRaffle.scss';

const CreateRaffle: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha: '',
    tipo: '',
    sorteo: false,
    cantidadDeNumeros: 100,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value =
      e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await addDoc(collection(db, 'rifas'), {
        ...formData,
        fecha: Timestamp.fromDate(new Date(formData.fecha)),
        creadorId: currentUser?.uid,
        numerosSeleccionados: {},
      });
      // Redirigir al administrador a la página de administración
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="create-raffle container">
      <h2>Crear Nueva Rifa 🎟️</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Campos del formulario */}
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la Rifa"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={formData.descripcion}
          onChange={handleChange}
          required
        ></textarea>
        <input
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          required
        />
        <select name="tipo" value={formData.tipo} onChange={handleChange} required>
          <option value="">Selecciona el tipo de rifa</option>
          <option value="Nacional">Nacional</option>
          <option value="Quiniela">Quiniela</option>
          {/* Agrega más opciones según sea necesario */}
        </select>
        <div>
          <label>
            <input
              type="radio"
              name="sorteo"
              value="false"
              checked={!formData.sorteo}
              onChange={handleChange}
            />
            Rifa (Paga)
          </label>
          <label>
            <input
              type="radio"
              name="sorteo"
              value="true"
              checked={formData.sorteo}
              onChange={handleChange}
            />
            Sorteo (Gratuito)
          </label>
        </div>
        <select
          name="cantidadDeNumeros"
          value={formData.cantidadDeNumeros}
          onChange={handleChange}
          required
        >
          <option value={100}>1 a 100</option>
          <option value={1000}>1 a 1000</option>
          <option value={10000}>1 a 10000</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Crear Rifa
        </button>
      </form>
    </div>
  );
};

export default CreateRaffle;
