import { useState, useEffect } from 'react'
import './App.css'
import { Routes, Route, Navigate } from "react-router";
import API from "./API/API.js"
import { LoginForm } from "./components/AuthComponents.jsx"
import { NavHeader } from "./components/NavHeader.jsx"
import { GameComponent } from "./components/GameComponent.jsx"
import { Leaderboard } from "./components/Leaderboard.jsx"


function App() {

  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState(null);


  useEffect(() => { // reindirizza se c'è una sessione attiva
    const checkSession = async () => {
      try {
        const user = await API.getSession();
        setUser(user);
        setLoggedIn(true);
      } catch {
        setLoggedIn(false);
      }
    }
    checkSession();
  }, []);



  useEffect(() => { // fa svanire i messaggi
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [message]);


  const handleLogin = async (credentials) => {
    try {
      const user = await API.login(credentials.email, credentials.password);
      setLoggedIn(true);
      setUser(user);
    } catch {
      setMessage({ msg: "Email o password errate. Riprova.", type: "danger" });
    }
  }

  const handleLogout = async () => {
    try {
      await API.logout();
      setLoggedIn(false);
      setMessage(null);
      setUser(undefined)
    } catch {
      setMessage({ msg: "Logout non riuscito. Riprova.", type: "danger" });
    }
  }

  const refreshUser = async () => {
    try {
      const updatedUser = await API.getSession();
      setUser(updatedUser);
    } catch {
      setLoggedIn(false);
      setUser(undefined);
    }
  }

  return (
    <>
      <NavHeader handleLogout={handleLogout} loggedIn={loggedIn} />
      <Routes>
        <Route
          path='/'
          element={loggedIn ? <Navigate replace to='/play/game' /> : <LoginForm handleLogin={handleLogin} message={message} />}
        />
        <Route
          path='/play/game'
          element={loggedIn ? <GameComponent user={user} refreshUser={refreshUser}/> : <Navigate replace to='/' />}
        />
        <Route
          path='/leaderboard'
          element={loggedIn ? <Leaderboard /> : <Navigate replace to='/' />}
        />
        <Route path='*' element={<Navigate replace to='/' />} />
      </Routes>
    </>
  )
}

export default App
