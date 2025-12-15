import React, { useContext } from 'react'
import assets from '../assets/assets'
import { useState } from 'react'
import { AuthContext } from '../../context/AuthContext'

const LoginPage = () => {
  const [currState, setCurrState] = useState('signup') // login / signup
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const {login} = useContext(AuthContext);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (currState === 'signup' && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    // Add your login/signup logic here
    login(currState ===  'signup' ? "signup" :'login' ,{ fullName, email, password, bio });

  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center
    justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/*
        left
      */}
      <img src={assets.logo_big} alt="" className='w-60' />

      {/*
        right
      */}
      <form
        onSubmit={onSubmitHandler}
        action="" className='border-2 bg-white/8 text-white
       border-gray-500 rounded-lg p-6 flex flex-col gap-6 shadow-lg w-76
      '>
        <h2 className='text-2xl font-medium flex justify-between items-center'
        >{currState}{isDataSubmitted && <img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' />}

        </h2>
        {currState === 'signup' && !isDataSubmitted && (
          <input onChange={(e) => setFullName(e.target.value)} value={fullName}
            type="text" placeholder='Full Name' className='p-2 border border-gray-500 
             rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ' required />)}

        {
          !isDataSubmitted && (
            <>
              <input onChange={(e) => setEmail(e.target.value)} value={email}
                type="email" placeholder='Email'
                className='p-2 border border-gray-500  rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ' />
              <input onChange={(e) => setPassword(e.target.value)} value={password}
                type="password" placeholder='Password'
                className='p-2 border border-gray-500  rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ' />
            </>)}
        {currState === 'signup' && isDataSubmitted && (
          <textarea onChange={(e) => setBio(e.target.value)} value={bio}
            placeholder='Bio' rows={3}
            className='p-2 border border-gray-500  rounded-md focus:outline-none
             focus:ring-2 focus:ring-indigo-500 ' required></textarea>)}
        <button type="submit"
          className='py-3 px-6 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'
        >
          {currState === "signup" ? "Create Account" : "Login"}
        </button>

        <div className='flex items-center gap-2 text-xs opacity-80'>
          <input type="checkbox" />
          <p>Agree to the terms of & privacy policy</p>
        </div>
        <div>
          {currState === 'signup' ? (
            <p className='text-sm'>Already have an account?
              <span onClick={() => {
                setCurrState('login');
                setIsDataSubmitted(false);
                setFullName('');
                setEmail('');
                setPassword('');
                setBio('');
              }}
                className='text-blue-400 cursor-pointer'> Login</span>
            </p>
          ) : (
            <p className='text-sm'>Don't have an account?
              <span onClick={() => {
                setCurrState('signup');
                setIsDataSubmitted(false);
                setFullName('');
                setEmail('');
                setPassword('');
                setBio('');
              }}
                className='text-blue-400 cursor-pointer'> Sign Up</span>
            </p>
          )}
        </div>

      </form>
    </div>
  )
}

export default LoginPage
