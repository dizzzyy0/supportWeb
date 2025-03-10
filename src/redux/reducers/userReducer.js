import {
    GET_USERS,
    GET_USER_BY_ID,
    UPDATE_USER,
    DELETE_USER,
    USER_ERROR,
} from "../actions/userAction";

const initialState = {
users: [], 
user: null, 
error: null, 
};

const userReducer = (state = initialState, action) => {
switch (action.type) {

case GET_USERS:
    return { ...state, users: action.payload, error: null };

case GET_USER_BY_ID:
    return { ...state, user: action.payload, error: null };

case UPDATE_USER:
    return {
    ...state,
    users: state.users.map((usr) =>
        usr._id === action.payload._id ? { ...usr, ...action.payload } : usr
    ),
    error: null,
    };

case DELETE_USER:
    return {
    ...state,
    users: state.users.filter((usr) => usr._id !== action.payload),
    error: null,
    };

case USER_ERROR:
    return { ...state, error: action.payload };

default:
    return state;
}
};

export default userReducer;