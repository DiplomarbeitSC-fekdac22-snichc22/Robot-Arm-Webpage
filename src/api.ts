import type { DetectionObject } from "./types";

export const BACKEND_URL = "http://localhost:8080";
    import.meta.env.VITE_BACKEND_URL || "http://192.168.74.17:8000";

interface BackendErrorResponse {
    status?: string;
    code?: string;
    message?: string;
}

export class ApiError extends Error {
    code: string;
    statusCode: number;

    constructor(
        message: string,
        code = "UNKNOWN_ERROR",
        statusCode = 0,
    ) {
        super(message);

        this.name = "ApiError";
        this.code = code;
        this.statusCode = statusCode;
    }
}

export function backendUrl(path: string): string {
    return `${BACKEND_URL}${path}`;
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
    timeoutMs = 5000,
): Promise<T> {
    const controller = new AbortController();

    const timeout = window.setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    try {
        let response: Response;

        try {
            response = await fetch(backendUrl(path), {
                ...options,
                signal: controller.signal,
                headers: {
                    Accept: "application/json",
                    ...options.headers,
                },
            });
        } catch (error) {
            if (
                error instanceof DOMException &&
                error.name === "AbortError"
            ) {
                throw new ApiError(
                    "Backend request timed out",
                    "BACKEND_TIMEOUT",
                    504,
                );
            }

            throw new ApiError(
                "Backend is unavailable",
                "BACKEND_UNAVAILABLE",
                503,
            );
        }

        let data: unknown = null;

        try {
            data = await response.json();
        } catch {
            // The response might not contain valid JSON.
        }

        if (!response.ok) {
            const backendError =
                data as BackendErrorResponse | null;

            throw new ApiError(
                backendError?.message ??
                `Backend request failed (${response.status})`,
                backendError?.code ?? "BACKEND_ERROR",
                response.status,
            );
        }

        return data as T;
    } finally {
        window.clearTimeout(timeout);
    }
}

interface ObjectsResponse {
    timestamp: string;
    objects: DetectionObject[];
}

export async function loadObjects(): Promise<DetectionObject[]> {
    const response = await apiRequest<ObjectsResponse>(
        "/objects",
    );

    if (!response || !Array.isArray(response.objects)) {
        throw new ApiError(
            "Detection temporarily disabled",
            "INVALID_DETECTION_RESPONSE",
            502,
        );
    }

    return response.objects;
}

