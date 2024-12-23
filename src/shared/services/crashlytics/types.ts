export interface ErrorInfo {
    componentStack: string;
    [key: string]: any;
}

export interface CrashlyticsConfig {
    userId?: string;
    customKeys?: Record<string, string>;
}