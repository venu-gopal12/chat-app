import { createContext } from "react";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    //check if user is authenticated if so ,set user data and connect to socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get('/api/auth/check')
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            // If check fails (e.g., expired token), clear the stale token/state
            if (token) {
                console.warn('Auth check failed. Clearing client-side token.', error.response?.data || error.message);
                setToken(null);
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
                delete axios.defaults.headers.common['token'];
            }
            toast.error(error.response?.data?.message || error.message);
        }
    }

    //login function to handle user authentication and socket connection
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setToken(data.token);
                localStorage.setItem('token', data.token);
                setAuthUser(data.userData);
                connectSocket(data.userData);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    //logout function to handle user logout and socket disconnection
    //logout function to handle user logout and socket disconnection
const logout = async () => {
  try {
    await axios.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout API failed:', error);
  }

  setToken(null);
  localStorage.removeItem('token');
  setAuthUser(null);
  setOnlineUsers([]);
  delete axios.defaults.headers.common['Authorization'];
  delete axios.defaults.headers.common['token'];
  socket?.disconnect();
  toast.success("Logged out successfully");
}
    //update profile function to handle user profile update
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put('/api/auth/update-profile', body);
           
                setAuthUser(data.user);
                toast.success(data.message);
            
        } catch (error) {
            toast.error(error.message); 
        }
    }

    //connect to socket function to handle socket connection
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: { userId: userData._id },
        });
        newSocket.connect()
        setSocket(newSocket);
        newSocket.on('getOnlineUsers', (userIds) => {
            setOnlineUsers(userIds);
        })
    }

    useEffect(() => {
  if (token) {
    // send both headers for compatibility (backend may expect either)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['token'] = token;
    checkAuth();
  } else {
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['token'];
  }
}, [token]);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,

    }; // Add your auth-related values and functions here
    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}

