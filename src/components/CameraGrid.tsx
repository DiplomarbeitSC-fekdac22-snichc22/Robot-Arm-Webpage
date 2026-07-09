import { BACKEND_URL } from "../api";

type CameraGridProps = {
    twoCameraMode: boolean;
};

export const CameraGrid = ({ twoCameraMode }: CameraGridProps) => {
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
                <img src={rawUrl} alt="Raw stream" />
            </div>

            <div className="camera-card">
                <div className="camera-title">Detection Stream</div>
                <img src={detectUrl} alt="Detection stream" />
            </div>
        </section>
    );
}