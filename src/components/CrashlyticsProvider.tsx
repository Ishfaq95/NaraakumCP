import React, { FC, ReactNode, useEffect } from 'react';
import { crashlyticsService } from '../shared/services/crashlytics/crashlytics.service';
import { CrashlyticsConfig } from '../shared/services/crashlytics/types';

interface CrashlyticsProviderProps extends CrashlyticsConfig {
    children: ReactNode;
}

export const CrashlyticsProvider: FC<CrashlyticsProviderProps> = ({
    children,
    userId,
    customKeys
}) => {
    useEffect(() => {
        crashlyticsService.initialize({ userId, customKeys });
    }, [userId, customKeys]);

    return <>{children}</>;
};