import { store } from "../redux/store";
import WebSocketService from "../../components/WebSocketService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { encode as btoa } from 'base-64';
import { setTopic } from "../redux/reducers/userReducer";
import messaging from '@react-native-firebase/messaging';

export const InvokeSocket=async ()=>{
    const webSocketService = WebSocketService.getInstance();
    const persistedState = await AsyncStorage.getItem('persist:root');
    if (persistedState) {
      const parsedState = JSON.parse(persistedState); 
      const rootState = JSON.parse(parsedState.user);
      const {communicationKey,id}=rootState.user
      const presence = 1; 

      webSocketService.connect(presence, communicationKey,id);
    }else{
      
    webSocketService.disconnect()
  }
}

export const isTokenExpired = (expiresAt:any) => {
  if(expiresAt==null || expiresAt==undefined){
    return true
  }
  return new Date() > new Date(expiresAt);
};

export const subsribeTopic = (Id: any, topic: any, dispatch: any) => {
  const topicName = `serviceprovider_${Id}`;

  if (topic) {
    if (topic != topicName) {
      messaging()
        .unsubscribeFromTopic(topic)
        .then(() => { });

      dispatch(setTopic(topicName));

      messaging()
        .subscribeToTopic(topicName)
        .then(() => { });
    }
  } else {
    dispatch(setTopic(topicName));
    messaging()
      .subscribeToTopic(topicName)
      .then(() => { });
  }
};


export function encryptText(text, key) {
  const encrypted = CryptoJS.AES.encrypt(text, key).toString();
  return btoa(encrypted);
}

export const generateUniqueId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

export const convertArabicTimeTo24Hour = (timeString: string): string => {
  if (!timeString) return timeString;

  const parts = timeString.trim().split(' ');
  if (parts.length < 2) {
    return timeString;
  }

  const timePart = parts[0];
  const periodPart = parts[1];

  const [hours, minutes] = timePart.split(':').map(Number);

  let hour24 = hours;

  if (periodPart === 'ص') {
    if (hours === 12) {
      hour24 = 0;
    }
  } else if (periodPart === 'م') {
    if (hours !== 12) {
      hour24 = hours + 12;
    }
  } else {
  }

  const result = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return result;
};