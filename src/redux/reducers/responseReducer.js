import {
    GET_RESPONSES,
    GET_RESPONSE_BY_ID,
    CREATE_RESPONSE,
    UPDATE_RESPONSE,
    DELETE_RESPONSE,
    RESPONSE_ERROR,
} from "../actions/responseAction";

const initialState = {
responses: [], 
response: null, 
error: null, 
};

const responseReducer = (state = initialState, action) => {
switch (action.type) {

    case GET_RESPONSES:
    return { ...state, responses: action.payload, error: null };

    case GET_RESPONSE_BY_ID:
    return { ...state, response: action.payload, error: null };

    case CREATE_RESPONSE:
    return { ...state, responses: [...state.responses, action.payload], error: null };

    case UPDATE_RESPONSE:
    return {
        ...state,
        responses: state.responses.map((res) =>
        res._id === action.payload._id ? { ...res, ...action.payload } : res
        ),
        error: null,
    };

    case DELETE_RESPONSE:
    return {
        ...state,
        responses: state.responses.filter((res) => res._id !== action.payload),
        error: null,
    };

    case RESPONSE_ERROR:
    return { ...state, error: action.payload };

    default:
    return state;
}
};

export default responseReducer;