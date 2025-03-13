import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/request`;

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

export const createRequest = async (requestData) => {
    try {
        const response = await axiosInstance.post("/", requestData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error creating request"
        );
    }
};

export const fetchAllRequests = async () => {
    try {
        const response = await axiosInstance.get("/all");
        return response.data;
    } catch (error) {
        throw new Error(
        error.response?.data?.message || "Error fetching all requests"
        );
    }
};

export const fetchRequestById = async (requestId) => {
    try {
        const response = await axiosInstance.get(`/${requestId}`);
        return response.data;
    } catch (error) {
        throw new Error(
        error.response?.data?.message || "Error fetching request by ID"
        );
    } 
};

export const updateRequest = async (requestId, updatedData) => {
    try {
        const response = await axiosInstance.put(`/${requestId}`, updatedData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error updating request"
        );
    }
};

export const updateRequestStatus = async (requestId, statusData) => {
    try {
        const response = await axiosInstance.put(`/${requestId}/status`, statusData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error updating request status"
        );
    }
};

export const addResponseToRequest = async (requestId, responseData) => {
    try {
        const response = await axiosInstance.post(`/${requestId}/response`, responseData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error adding response to request"
        );
    }
};

export const findRequests = async (status, clientId) => {
    try {
        const response = await axiosInstance.get("/", {
            params: { status, clientId },
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error finding requests"
        );
    }
};

export const fetchRequestWithResponses = async (requestId) => {
    try {
        const response = await axiosInstance.get(`/${requestId}/responses`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error fetching request with responses"
        );
    }
};

export const deleteRequest = async (requestId) => {
    try {
        const response = await axiosInstance.delete(`/${requestId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Error deleting request"
        );
    }
};
