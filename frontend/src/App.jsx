import { useState, useEffect} from 'react'
import Navbar from './components/Navbar.jsx'
import {Routes,Route, Navigate} from "react-router-dom"
import './App.css'

import HomePage from './pages/homepage'
import SignupPage from './pages/signuppage'
import LoginPage from './pages/loginpage'
import SettingsPage from './pages/settingspage'
import ProfilePage from './pages/profilepage'

import {useAuthStore} from './store/useAuthStore'
import {useThemeStore} from './store/useThemeStore'
import {Loader} from "lucide-react"

import {Toaster} from 'react-hot-toast'

function App() {
  const {authUser,checkAuth,isCheckingAuth,onlineUsers} = useAuthStore()
  const {theme} = useThemeStore()

  console.log({onlineUsers});
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({authUser});

  if(isCheckingAuth && !authUser)return(
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-30 animate-spin"/>

    </div>
  )

  return (
    
     <div data-theme={theme} >
     <Navbar/>
    <Routes>
      <Route path="/" element={authUser ? <HomePage />:  <Navigate to="/login"/>}></Route>
      <Route path="/signup" element={!authUser ? <SignupPage/> :<Navigate to="/"/> }></Route>
      <Route path="/login" element={!authUser ? <LoginPage />: <Navigate to="/"/>}></Route>
      <Route path="/settings" element={<SettingsPage />}></Route>
      <Route path="/profile" element={authUser ? <ProfilePage />:  <Navigate to="/login"/>}></Route>
    </Routes>

    <Toaster/>
     </div>
    
  )
}

export default App
