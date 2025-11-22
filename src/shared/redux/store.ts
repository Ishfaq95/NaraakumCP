import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {persistReducer, persistStore} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer from './reducers/userReducer';
import {TypedUseSelectorHook, useSelector} from 'react-redux';
import generalDataReducer from './reducers/generalDataReducer';
import bookingReducer from './reducers/bookingReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user','booking'],
};

const reducers = combineReducers({
  user: userReducer,
  generalData: generalDataReducer,
  booking: bookingReducer,
});

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: {
    root: persistedReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
