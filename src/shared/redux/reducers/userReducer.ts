import {createSlice} from '@reduxjs/toolkit';

interface State {
  userinfo: any;
  topic:any;
  token:any;
  expiresAt:any;
}

const initialState: State = {
  userinfo:null,
  topic: null,
  token: null,
  expiresAt: null,
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
      console.log('Action=>',action)
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
