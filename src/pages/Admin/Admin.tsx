import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Admin.scss';

interface Rifa {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: any;
  tipo: string;
  sorteo: boolean;
  cantidadDeNumeros: number;
}

const Admin: React.FC = () => {
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchRifas = async () => {
      const q = query(
        collection(db, 'rifas'),
        where('creadorId', '==', currentUser?.uid)
      );
      const querySnapshot = await getDocs(q);
      const rifasData: Rifa[] = [];
      querySnapshot.forEach((doc) => {
        rifasData.push({ id: doc.id, ...doc.data() } as Rifa);
      });
      setRifas(rifasData);
    };

    fetchRifas();
  }, [currentUser]);

  return (
    <div className="admin container">
      <h2>Panel de Administración 🛠️</h2>
      <Link to="/create-raffle" className="btn btn-primary mb-3">
        Crear Nueva Rifa
      </Link>
      <div className="list-group">
        {rifas.map((rifa) => (
          <Link
            key={rifa.id}
            to={`/raffle/${rifa.id}`}
            className="list-group-item list-group-item-action"
          >
            {rifa.nombre}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Admin;
