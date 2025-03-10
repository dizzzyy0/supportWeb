import axios from 'axios';

const API_URL = `${process.env.API_URL}/response`;

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

export const fetchResponses = async () => {
    try {
        const response = await axiosInstance.get("/");
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error fetching responses"
        );
    }
};


export const fetchResponseById = async (responseId) => {
    try {
        const response = await axiosInstance.get(`/${responseId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error fetching response"
        );
    }
};

export const createResponse = async (responseData) => {
    try {
        const response = await axiosInstance.post("/", responseData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error creating response"
        );
    }
};

export const updateResponse = async (responseId, updatedData) => {
    try {
        const response = await axiosInstance.put(`/${responseId}`, updatedData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error updating response"
        );
    }
};

export const deleteResponse = async (responseId) => {
    try {
        const response = await axiosInstance.delete(`/${responseId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error deleting response"
        );
    }
};