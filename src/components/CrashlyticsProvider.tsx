import React, {FC, ReactNode, useEffect} from 'react';
import {CrashlyticsConfig} from '../shared/services/crashlytics/types';
import {crashlyticsService} from '../shared/services/crashlytics/crashlytics.service';

interface CrashlyticsProviderProps extends CrashlyticsConfig {
  children: ReactNode;
}

export const CrashlyticsProvider: FC<CrashlyticsProviderProps> = ({
  children,
  userId,
  customKeys,
}) => {
  useEffect(() => {
    crashlyticsService.initialize({userId, customKeys});
  }, [userId, customKeys]);

  return <>{children}</>;
};
