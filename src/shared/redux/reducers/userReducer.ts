import {createSlice} from '@reduxjs/toolkit';
import { Platform } from 'react-native';

interface State {
  userinfo: any;
  topic:any;
  token:any;
  expiresAt:any;
  appVersionCode:any;
}

const initialState: State = {
  userinfo:null,
  topic: null,
  token: null,
  expiresAt: null,
  appVersionCode: Platform.OS=="android"? "1.0.3":"1.0.0"
};

export const userReducer = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setTopic: (state, action) => {
      state.topic = action.payload;
    },
    setUserInfo: (state, action) => {
      state.userinfo = action.payload;
    },
    setToken:(state = initialState, action)=>{
      return {
        ...state,
        token: action.payload.token,
        expiresAt: action.payload.expiresAt,
      };
    }
  },
});

export const { setTopic,setUserInfo,setToken } = userReducer.actions;

export default userReducer.reducer;
