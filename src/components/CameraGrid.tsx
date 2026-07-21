import { BACKEND_URL } from "../api";

interface CameraGridProps {
    twoCameraMode: boolean;
    onCameraError?: (message: string | null) => void;
}

export const CameraGrid = ({twoCameraMode, onCameraError}: CameraGridProps) => {
    const rawUrl = `${BACKEND_URL}/video`;
    const detectUrl = `${BACKEND_URL}/detect`;

    if (!twoCameraMode) {
        return (
            <section className="camera-grid one-camera">
                <div className="camera-card">
                    <div className="camera-title">Detection Stream</div>
                    <img src={detectUrl} alt="Detection stream" />
                </div>
            </section>
        );
    }

    return (
        <section className="camera-grid two-cameras">
            <div className="camera-card">
                <div className="camera-title">Raw Stream</div>
                <img
                    src={rawUrl}
                    alt="Robot arm camera"
                    onLoad={() => onCameraError?.(null)}
                    onError={() =>
                        onCameraError?.("Camera unavailable")
                    }
                />
            </div>

            <div className="camera-card">
                <div className="camera-title">Detection Stream</div>
                <img
                    src={detectUrl}
                    alt="Object detection camera"
                    onLoad={() => onCameraError?.(null)}
                    onError={() =>
                        onCameraError?.(
                            "Detection temporarily disabled",
                        )
                    }
                />
            </div>
        </section>
    );
}