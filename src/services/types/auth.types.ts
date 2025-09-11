export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        // Add other user fields as needed
    };
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
} 