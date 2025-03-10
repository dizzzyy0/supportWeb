import {
    GET_REQUESTS,
    GET_REQUEST_BY_ID,
    CREATE_REQUEST,
    UPDATE_REQUEST,
    UPDATE_REQUEST_STATUS,
    ADD_RESPONSE_TO_REQUEST,
    FIND_REQUESTS,
    GET_REQUEST_WITH_RESPONSES,
    DELETE_REQUEST,
    REQUEST_ERROR,
} from "../actions/requestAction";

const initialState = {
requests: [], 
request: null, 
error: null, 
};

const requestReducer = (state = initialState, action) => {
switch (action.type) {
    case GET_REQUESTS:
    return { ...state, requests: action.payload, error: null };

    case GET_REQUEST_BY_ID:
    return { ...state, request: action.payload, error: null };

    case CREATE_REQUEST:
    return { ...state, requests: [...state.requests, action.payload], error: null };

    case UPDATE_REQUEST:
    return {
        ...state,
        requests: state.requests.map((req) =>
        req._id === action.payload._id ? { ...req, ...action.payload } : req
        ),
        error: null,
    };

    case UPDATE_REQUEST_STATUS:
    return {
        ...state,
        requests: state.requests.map((req) =>
        req._id === action.payload._id ? { ...req, status: action.payload.status } : req
        ),
        error: null,
    };

    case ADD_RESPONSE_TO_REQUEST:
    return {
        ...state,
        requests: state.requests.map((req) =>
        req._id === action.payload.requestId
            ? { ...req, responses: [...req.responses, action.payload.response] }
            : req
        ),
        error: null,
    };

    case FIND_REQUESTS:
    return { ...state, requests: action.payload, error: null };

    case GET_REQUEST_WITH_RESPONSES:
    return { ...state, request: action.payload, error: null };

    case DELETE_REQUEST:
    return {
        ...state,
        requests: state.requests.filter((req) => req._id !== action.payload),
        error: null,
    };

    case REQUEST_ERROR:
    return { ...state, error: action.payload };

    default:
    return state;
}
};

export default requestReducer;