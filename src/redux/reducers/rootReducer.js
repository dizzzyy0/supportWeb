import { combineReducers } from "redux";
import requestReducer from './requestReducer';
import responseReducer from './responseReducer';
import  userReducer  from './userReducer';

const rootReducer = combineReducers({
    requests: requestReducer,
    responses: responseReducer,
    users: userReducer
});

export default rootReducer;