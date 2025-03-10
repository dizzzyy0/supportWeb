import {
    createRequest,
    fetchAllRequests,
    fetchRequestById,
    updateRequest,
    updateRequestStatus,
    addResponseToRequest,
    findRequests,
    fetchRequestWithResponses,
    deleteRequest,
} from "../../services/requestService";

export const GET_REQUESTS = "GET_REQUESTS";
export const GET_REQUEST_BY_ID = "GET_REQUEST_BY_ID";
export const CREATE_REQUEST = "CREATE_REQUEST";
export const UPDATE_REQUEST = "UPDATE_REQUEST";
export const UPDATE_REQUEST_STATUS = "UPDATE_REQUEST_STATUS";
export const ADD_RESPONSE_TO_REQUEST = "ADD_RESPONSE_TO_REQUEST";
export const FIND_REQUESTS = "FIND_REQUESTS";
export const GET_REQUEST_WITH_RESPONSES = "GET_REQUEST_WITH_RESPONSES";
export const DELETE_REQUEST = "DELETE_REQUEST";
export const REQUEST_ERROR = "REQUEST_ERROR";

export const getAllRequestsAction = () => async (dispatch) => {
    try {
        const data = await fetchAllRequests();
        dispatch({ type: GET_REQUESTS, payload: data });
    } catch (error) {
        dispatch({ type: REQUEST_ERROR, payload: error.message });
    }
};

export const getRequestByIdAction = (requestId) => async (dispatch) => {
    try {
        const data = await fetchRequestById(requestId);
        dispatch({ type: GET_REQUEST_BY_ID, payload: data });
    } catch (error) {
        dispatch({ type: REQUEST_ERROR, payload: error.message });
    }
};

export const createRequestAction = (requestData) => async (dispatch) => {
    try {
        const data = await createRequest(requestData);
        dispatch({ type: CREATE_REQUEST, payload: data });
    } catch (error) {
        dispatch({ type: REQUEST_ERROR, payload: error.message });
    }
};

export const updateRequestAction = (requestId, updatedData) => async (dispatch) => {
    try {
        const data = await updateRequest(requestId, updatedData);
        dispatch({ type: UPDATE_REQUEST, payload: data });
    } catch (error) {
        dispatch({ type: REQUEST_ERROR, payload: error.message });
    }
};

export const updateRequestStatusAction = (requestId, statusData) => async (dispatch) => {
    try {
        const data = await updateRequestStatus(requestId, statusData);
        dispatch({ type: UPDATE_REQUEST_STATUS, payload: data });
    } catch (error) {
        dispatch({ type: REQUEST_ERROR, payload: error.message });
    }
};

export const addResponseToRequestAction = (requestId, responseData) => async (dispatch) => {
    try {
        const data = await addResponseToRequest(requestId, responseData);
        dispatch({ type: ADD_RESPONSE_TO_REQUEST, payload: data });
    } catch (error) {
        dispatch({ type: REQUEST_ERROR, payload: error.message });
    }
};

export const findRequestsAction = (status, clientId) => async (dispatch) => {
    try {
        const data = await findRequests(status, clientId);
        dispatch({ type: FIND_REQUESTS, payload: data });
    } catch (error) {
        dispatch({ type: REQUEST_ERROR, payload: error.message });
    }
};

export const getRequestWithResponsesAction = (requestId) => async (dispatch) => {
    try {
        const data = await fetchRequestWithResponses(requestId);
        dispatch({ type: GET_REQUEST_WITH_RESPONSES, payload: data });
    } catch (error) {
        dispatch({ type: REQUEST_ERROR, payload: error.message });
    }
};

export const deleteRequestAction = (requestId) => async (dispatch) => {
    try {
        await deleteRequest(requestId);
        dispatch({ type: DELETE_REQUEST, payload: requestId });
    } catch (error) {
        dispatch({ type: REQUEST_ERROR, payload: error.message });
    }
};