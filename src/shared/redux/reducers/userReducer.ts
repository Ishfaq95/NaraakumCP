import {createSlice} from '@reduxjs/toolkit';
import { Platform } from 'react-native';

interface State {
  user: any;
  topic:any;
  token:any;
  expiresAt:any;
  appVersionCode:any;
  mediaToken:any;
  mediaTokenExpiresAt:any;
  rememberMeRedux:any;
}

const initialState: State = {
  user:null,
  topic: null,
  token: null,
  expiresAt: null,
  appVersionCode: Platform.OS=="android"? "1.0.2":"1.0.0",
  mediaToken: null,
  mediaTokenExpiresAt: null,
  rememberMeRedux: false,
};

export const userReducer = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setTopic: (state, action) => {
      state.topic = action.payload;
    },
    setToken:(state = initialState, action)=>{
      return {
        ...state,
        token: action.payload.token,
        expiresAt: action.payload.expiresAt,
      };
    },
    setRememberMeRedux: (state, action) => {
      state.rememberMeRedux = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setMediaToken: (state = initialState, action) => {
      return {
        ...state,
        mediaToken: action.payload.token,
        mediaTokenExpiresAt: action.payload.expiresAt,
      };
    }
  },
});

export const { setTopic,setToken,setMediaToken,setRememberMeRedux,setUser } = userReducer.actions;

export default userReducer.reducer;
