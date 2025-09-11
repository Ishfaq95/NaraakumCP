import TrackPlayer, { Event, RepeatMode, State, Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';

export class TrackPlayerService {
  static initialized = false;

  static async setupPlayer() {
    if (TrackPlayerService.initialized) {
      return;
    }
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
        ],
      });
      TrackPlayerService.initialized = true;
    } catch (error) {
      console.error('Error setting up track player:', error);
      throw error;
    }
  }

  static isInitialized() {
    return TrackPlayerService.initialized;
  }

  static async addTrack(url: string, title: string = 'Audio Recording') {
    try {
      await TrackPlayer.reset(); // Always clear the queue before adding
      await TrackPlayer.add({
        id: 'audio-track',
        url: url,
        title: title,
        artist: 'User Recording',
        duration: 0, // Will be set automatically
      });
    } catch (error) {
      console.error('Error adding track:', error);
      throw error;
    }
  }

  static async play() {
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  }

  static async pause() {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error('Error pausing track:', error);
      throw error;
    }
  }

  static async stop() {
    try {
      // Only stop if initialized
      if (!TrackPlayerService.initialized) return;
      const state = await TrackPlayer.getState();
      if (state !== State.None) {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
      }
    } catch (error) {
      console.error('Error stopping track:', error);
      // Don't throw error for cleanup operations
    }
  }

  static async seekTo(position: number) {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.error('Error seeking track:', error);
      throw error;
    }
  }

  static async getPosition(): Promise<number> {
    try {
      return await TrackPlayer.getPosition();
    } catch (error) {
      console.error('Error getting position:', error);
      return 0;
    }
  }

  static async getDuration(): Promise<number> {
    try {
      return await TrackPlayer.getDuration();
    } catch (error) {
      console.error('Error getting duration:', error);
      return 0;
    }
  }

  static async getState(): Promise<State> {
    try {
      return await TrackPlayer.getState();
    } catch (error) {
      console.error('Error getting state:', error);
      return State.None;
    }
  }

  static async destroy() {
    try {
      if (!TrackPlayerService.initialized) return;
      const state = await TrackPlayer.getState();
      if (state !== State.None) {
        await TrackPlayer.reset();
      }
      TrackPlayerService.initialized = false;
    } catch (error) {
      console.error('Error destroying track player:', error);
    }
  }
}

// Event listeners for track player
export const setupTrackPlayerListeners = () => {
  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async (event) => {
    
  });

  TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
    
  });

  TrackPlayer.addEventListener(Event.PlaybackError, async (event) => {
    
  });
}; 