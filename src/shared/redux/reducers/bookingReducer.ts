import {createSlice} from '@reduxjs/toolkit';
import { Platform } from 'react-native';

interface CardItem {
  providerId: string;
  providerName: string;
  selectedSlot: string;
  selectedDate: string;
  provider: any; // Full provider object
  selectedSpecialtyOrService: any; // Now each cardItem has its own
  availability: any;
  selectedLocation: any;
}

interface State {
  category: any;
  services: any;
  cardItems: any;
  apiResponse: any;
  tempSlotDetail: any;
  selectedUniqueId: any;
  selectedLocation: any;
  homeDialysisCardItems: any;
  homeDialysisFilePaths: any;
  allCategoriesList:any;
}

const initialState = {
  category: null,
  services: null,
  cardItems: [],
  apiResponse: null,
  tempSlotDetail: null,
  selectedUniqueId: null,
  selectedLocation: null,
  homeDialysisCardItems: [],
  homeDialysisFilePaths: [],
  allCategoriesList:[]
} as State;

export const bookingReducer = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setAllCategoryList:(state, action) => {
      state.allCategoriesList = action.payload;
    },
    setServices: (state, action) => {
      state.services = action.payload;
    },
    addCardItem: (state, action) => {
      // Remove any existing selection and add new one
      state.cardItems = action.payload;
    },
    addHomeDialysisCardItem: (state, action) => {
      // Remove any existing selection and add new one
      state.homeDialysisCardItems = action.payload;
    },
    removeCardItem: (state, action) => {
      state.cardItems = state.cardItems.filter((item: any) => {
        if(action.payload.CatServiceId){
          return !(item.CatServiceId == action.payload.CatServiceId && item.ItemUniqueId == action.payload.ItemUniqueId);
        }else{
          return item.ItemUniqueId !== action.payload.ItemUniqueId;
        }
      });
      
    },
    clearCardItems: (state) => {
      state.cardItems = [];
    },
    setApiResponse: (state, action) => {
      state.apiResponse = action.payload;
    },
    prependCardItems: (state, action) => {
      // Add new items to the beginning of the array
      state.cardItems = [...action.payload, ...state.cardItems];
    },
    manageTempSlotDetail: (state, action) => {
      state.tempSlotDetail = action.payload;
    },
    setSelectedUniqueId: (state, action) => {
      state.selectedUniqueId = action.payload;
    },
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
    },
    setHomeDialysisFilePaths: (state, action) => {
      state.homeDialysisFilePaths = action.payload;
    }
  },
});

export const {setCategory,setAllCategoryList, setServices, addCardItem, addHomeDialysisCardItem, removeCardItem, clearCardItems, setApiResponse, prependCardItems, manageTempSlotDetail, setSelectedUniqueId, setSelectedLocation, setHomeDialysisFilePaths} = bookingReducer.actions;
export default bookingReducer.reducer;