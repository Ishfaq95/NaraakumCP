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