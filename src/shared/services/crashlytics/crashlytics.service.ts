import firebase  from '@react-native-firebase/app';
import crashlytics from '@react-native-firebase/crashlytics';
import { ErrorInfo, CrashlyticsConfig } from './types';

class CrashlyticsService {
    private static instance: CrashlyticsService;
    private isInitialized: boolean = false;

    private constructor() {
        // if (!firebase.apps.length) {
        //     firebase.initializeApp();
        // }
    }

    public static getInstance(): CrashlyticsService {
        if (!CrashlyticsService.instance) {
            CrashlyticsService.instance = new CrashlyticsService();
        }
        return CrashlyticsService.instance;
    }

    public async initialize(config?: CrashlyticsConfig): Promise<void> {
        try {
            if (this.isInitialized) {
                return;
            }

            await crashlytics().setCrashlyticsCollectionEnabled(true);
            
            // if (__DEV__) {
            //     await crashlytics().setCustomKey('debug_mode', 'enabled');
            //     console.log('Crashlytics initialized in debug mode');
            // }

            if (config?.userId) {
                await this.setUserId(config.userId);
            }

            this.isInitialized = true;
            await this.logMessage('Crashlytics initialization successful');
        } catch (error) {
            console.error('[CrashlyticsService] Initialization failed:', error);
        }
    }

    public async setUserId(userId: string): Promise<void> {
        try {
            await crashlytics().setUserId(userId);
        } catch (error) {
            console.error('[CrashlyticsService] Failed to set user ID:', error);
        }
    }

    public async logError(error: any): Promise<void> {
        try {
            await crashlytics().recordError(error);
        } catch (e) {
            console.error('[CrashlyticsService] Failed to log error:', e);
        }
    }

    public async logMessage(message: string): Promise<void> {
        try {
            await crashlytics().log(message);
        } catch (error) {
            console.error('[CrashlyticsService] Failed to log message:', error);
        }
    }

    public async handleFatalError(error: Error, errorInfo: ErrorInfo): Promise<void> {
        try {
            await this.logMessage('Fatal error caught');
            await crashlytics().recordError(error);
        } catch (e) {
            console.error('[CrashlyticsService] Failed to handle fatal error:', e);
        }
    }
}

export const crashlyticsService = CrashlyticsService.getInstance();