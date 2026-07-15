import type { DetectionObject } from "./types";

export const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://192.168.74.17:8000";

export const loadObjects = async (): Promise<DetectionObject[]> => {
    const response = await fetch(`${BACKEND_URL}/objects`);

    if (!response.ok) {
        throw new Error("Could not load detected objects");
    }

    const data = await response.json();

    return data.objects || [];
}