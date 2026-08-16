import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect,useState } from 'react'
import axios from 'axios'
import {useDispatch} from 'react-redux'
import { setUserData } from './redux/userSlice'

export  const  ServerUrl='http://localhost:8000'

const App = () => {
  const dispatch=useDispatch();
  // finding current user by finishing it s backend setup
  useEffect(() => {
   const getUser=async () => {
    try {
      const result=await axios.get(ServerUrl + '/api/user/current-user',{withCredentials:true})
      console.log('Fetched user from backend:', result.data);
      dispatch(setUserData(result.data))
      
    } catch (error) {
      console.error('Failed to get current user:', error.response?.data || error.message);
      dispatch(setUserData(null))
      
    }
   }
   getUser()

  }, [dispatch])
  
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/auth' element={<Auth/>}/>


    </Routes>
  )
}

export default App
