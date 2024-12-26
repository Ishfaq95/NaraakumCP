import React, { Component, ReactNode } from 'react';
import { Text } from 'react-native';
import { crashlyticsService } from '../shared/services/crashlytics/crashlytics.service';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class CrashlyticsErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: any): void {
        crashlyticsService.handleFatalError(error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return this.props.fallback || <Text>Something went wrong.</Text>;
        }
        return this.props.children;
    }
}