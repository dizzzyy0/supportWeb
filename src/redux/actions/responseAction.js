import {
    fetchResponses,
    fetchResponseById,
    createResponse,
    updateResponse,
    deleteResponse,
} from "../../services/responseService";

export const GET_RESPONSES = "GET_RESPONSES";
export const GET_RESPONSE_BY_ID = "GET_RESPONSE_BY_ID";
export const CREATE_RESPONSE = "CREATE_RESPONSE";
export const UPDATE_RESPONSE = "UPDATE_RESPONSE";
export const DELETE_RESPONSE = "DELETE_RESPONSE";
export const RESPONSE_ERROR = "RESPONSE_ERROR";

export const getAllResponsesAction = () => async (dispatch) => {
    try {
        const data = await fetchResponses();
        dispatch({ type: GET_RESPONSES, payload: data });
    } catch (error) {
        dispatch({ type: RESPONSE_ERROR, payload: error.message });
    }
};

export const getResponseByIdAction = (responseId) => async (dispatch) => {
    try {
        const data = await fetchResponseById(responseId);
        dispatch({ type: GET_RESPONSE_BY_ID, payload: data });
    } catch (error) {
        dispatch({ type: RESPONSE_ERROR, payload: error.message });
    }
};

export const createResponseAction = (responseData) => async (dispatch) => {
    try {
        const data = await createResponse(responseData);
        dispatch({ type: CREATE_RESPONSE, payload: data });
    } catch (error) {
        dispatch({ type: RESPONSE_ERROR, payload: error.message });
    }
};

export const updateResponseAction = (responseId, updatedData) => async (dispatch) => {
    try {
        const data = await updateResponse(responseId, updatedData);
        dispatch({ type: UPDATE_RESPONSE, payload: data });
    } catch (error) {
        dispatch({ type: RESPONSE_ERROR, payload: error.message });
    }
};

export const deleteResponseAction = (responseId) => async (dispatch) => {
    try {
        await deleteResponse(responseId);
        dispatch({ type: DELETE_RESPONSE, payload: responseId });
    } catch (error) {
        dispatch({ type: RESPONSE_ERROR, payload: error.message });
    }
};