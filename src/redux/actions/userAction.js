import {
    fetchAllUsers,
    fetchUserById,
    updateUser,
    deleteUser,
} from "../../services/userService";

export const GET_USERS = "GET_USERS";
export const GET_USER_BY_ID = "GET_USER_BY_ID";
export const UPDATE_USER = "UPDATE_USER";
export const DELETE_USER = "DELETE_USER";
export const USER_ERROR = "USER_ERROR";

export const getAllUsersAction = () => async (dispatch) => {
    try {
        const data = await fetchAllUsers();
        dispatch({ type: GET_USERS, payload: data });
    } catch (error) {
        dispatch({ type: USER_ERROR, payload: error.message });
    }
};

export const getUserByIdAction = (userId) => async (dispatch) => {
    try {
        const data = await fetchUserById(userId);
        dispatch({ type: GET_USER_BY_ID, payload: data });
    } catch (error) {
        dispatch({ type: USER_ERROR, payload: error.message });
    }
};

export const updateUserAction = (userId, updateUserData) => async (dispatch) => {
    try {
        const data = await updateUser(userId, updateUserData);
        dispatch({ type: UPDATE_USER, payload: data });
    } catch (error) {
        dispatch({ type: USER_ERROR, payload: error.message });
    }
};

export const deleteUserAction = (userId) => async (dispatch) => {
    try {
        await deleteUser(userId);
        dispatch({ type: DELETE_USER, payload: userId });
    } catch (error) {
        dispatch({ type: USER_ERROR, payload: error.message });
    }
};