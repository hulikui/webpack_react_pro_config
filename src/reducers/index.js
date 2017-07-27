import {combineReducers} from 'redux';
const initSatte = {
  username: 'Likui Hu'
};
export default function (state = initSatte, action) {
  switch (action.type) {
    case 'USER_TEST':
    return action.payload;
  }
}