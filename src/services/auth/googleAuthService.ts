import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Configure Google Sign In
GoogleSignin.configure({
  // Get this from Google Cloud Console
  webClientId: '1060639338997-trk5clk7fhaln0klkrum6a5fritpn3t6.apps.googleusercontent.com',
  offlineAccess: true,
});

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  photo?: string;
  familyName?: string;
  givenName?: string;
}


export const signInWithGoogle = async (): Promise<GoogleUser> => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    
    if (response.type !== 'success' || !response.data) {
      throw new Error('No user info returned from Google Sign In');
    }

    const { user } = response.data;
    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      photo: user.photo || undefined,
      familyName: user.familyName || undefined,
      givenName: user.givenName || undefined,
    };
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('User cancelled the login flow');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error('Sign in is in progress already');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Play services not available or outdated');
    } else {
      throw error;
    }
  }
}; 