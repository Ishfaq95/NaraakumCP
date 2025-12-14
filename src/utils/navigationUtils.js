import { CommonActions } from "@react-navigation/native";
 
/**
* Gets the current active screen name from navigation state
* @param {Object} navigation - The navigation object from React Navigation
* @returns {string} The name of the current active screen
*/
export const getCurrentScreen = (navigation) => {
  try {
    const state = navigation.getState();
    const route = state.routes[state.index];
 
    // If the route has nested navigators, get the deepest active route
    if (route.state) {
      const nestedState = route.state;
      const nestedRoute = nestedState.routes[nestedState.index];
      return nestedRoute.name;
    }
 
    return route.name;
  } catch (error) {
    {}
    return null;
  }
};
 
/**
* Gets the current active screen params from navigation state
* @param {Object} navigation - The navigation object from React Navigation
* @returns {Object} The params of the current active screen
*/
export const getCurrentScreenParams = (navigation) => {
  try {
    const state = navigation.getState();
    const route = state.routes[state.index];
 
    // If the route has nested navigators, get the deepest active route params
    if (route.state) {
      const nestedState = route.state;
      const nestedRoute = nestedState.routes[nestedState.index];
      return nestedRoute.params;
    }
 
    return route.params;
  } catch (error) {
    {}
    return null;
  }
};