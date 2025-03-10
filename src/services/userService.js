import axios from "axios";

const API_URL = `${process.env.API_URL}/user`;

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const fetchAllUsers = async () => {
    try {
        const response = await axiosInstance.get("/");
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error fetching all users"
        );
    }
};


export const fetchUserById = async (userId) => {
    try {
        const response = await axiosInstance.get(`/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error fetching user by ID"
        );
    }
};

export const updateUser = async (userId, updateUserData) => {
    try {
        const response = await axiosInstance.put(`/${userId}`, updateUserData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error updating user"
        );
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await axiosInstance.delete(`/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(
        error.response?.data?.message || "Error deleting user"
        );
    }
};
