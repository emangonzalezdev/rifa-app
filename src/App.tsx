// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Admin from './pages/Admin/Admin';
import CreateRaffle from './pages/CreateRaffle/CreateRaffle';
import RaffleDetails from './pages/RaffleDetails/RaffleDetails';
import SelectNumber from './pages/SelectNumber/SelectNumber';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar/Navbar';

function App() {
  return (
    <Router>
          <Navbar /> {/* Agregamos el Navbar aquí */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<PrivateRoute element={<Admin />} path={''} />} />
        <Route path="/create-raffle" element={<PrivateRoute element={<CreateRaffle />} path={''} />} />
        <Route path="/raffle/:id" element={<RaffleDetails />} />
        <Route path="/raffle/:id/select-number" element={<SelectNumber />} />
      </Routes>
    </Router>
  );
}

export default App;
