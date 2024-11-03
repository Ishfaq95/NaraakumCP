import { store } from "../redux/store";
import WebSocketService from "../../components/WebSocketService";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const InvokeSocket=async ()=>{
    const webSocketService = WebSocketService.getInstance();
    const persistedState = await AsyncStorage.getItem('persist:root');
    if (persistedState) {
      const parsedState = JSON.parse(persistedState); 
      const rootState = JSON.parse(parsedState.user);
      const {CommunicationKey,Id}=rootState.userinfo
      const presence = 1; 

      webSocketService.connect(presence, CommunicationKey,Id);
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