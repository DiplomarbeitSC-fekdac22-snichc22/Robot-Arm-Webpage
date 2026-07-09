export type DetectionObject = {
    id: string;
    class_id: number;
    class_name: string;
    confidence: number;
    crop_url: string;
    timestamp: string;
    bbox: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    center: {
        x: number;
        y: number;
    };
};