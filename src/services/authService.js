import axios from 'axios';

const API_URL = `${process.env.API_URL}/auth`;

export const AuthService = {
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }
            
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Something went wrong" };
        }
    },
    
    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Something went wrong" };
        }
    },
    
    logout: () => {
        localStorage.removeItem("token");
    },
    
    getCurrentToken: () => {
        return localStorage.getItem("token");
    },
    
    getCurrentUser: async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
            throw { message: "No token found" };
            }
    
            const response = await axios.get(`${API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
    
            console.log("RESPONSE", response.data);
    
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Something went wrong" };
        }
    },
};
