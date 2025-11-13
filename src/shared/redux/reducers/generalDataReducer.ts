import {createSlice} from '@reduxjs/toolkit';

interface State {
  countries: any;
  timezone: any;
  visitRecordData:any;
  visitmainId:any;
}

const initialState: State = {
  countries: null,
  timezone: null,
  visitRecordData:null,
  visitmainId:null
};

export const generalDataReducer = createSlice({
  name: 'generalData',
  initialState,
  reducers: {
    setCountries: (state, action) => {
      state.countries = action.payload;
    },
    setTimeZone: (state, action) => {
      state.timezone = action.payload;
    },
    setVisitMainId : (state: any, action: any) => {
      state.visitmainId = action.payload;
    },
    setVisitMainData : (state: any, action: any) => {
      state.visitRecordData = action.payload;
    },
  },
});

export const {setCountries, setTimeZone, setVisitMainData, setVisitMainId} =generalDataReducer.actions;

export default generalDataReducer.reducer;
