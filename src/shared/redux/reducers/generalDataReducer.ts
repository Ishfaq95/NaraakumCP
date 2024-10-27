import {createSlice} from '@reduxjs/toolkit';

interface State {
  countries: any;
  timezone: any;
}

const initialState: State = {
  countries: null,
  timezone: null,
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
  },
});

export const {setCountries, setTimeZone} =generalDataReducer.actions;

export default generalDataReducer.reducer;
