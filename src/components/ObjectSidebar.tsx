import type { DetectionObject } from "../types";

type ObjectSidebarProps = {
    objects: DetectionObject[];
    loading: boolean;
    onRefresh: () => void;
    onSelectObject: (object: DetectionObject) => void;
};

export const ObjectSidebar = ({
                                  objects,
                                  loading,
                                  onRefresh,
                                  onSelectObject,
                              }: ObjectSidebarProps)=> {
    return (
        <aside className="sidebar">
            <h2>Detected Objects</h2>

            <button className="refresh-button" onClick={onRefresh}>
                {loading ? "Scanning..." : "Scan Objects"}
            </button>

            <div className="object-list">
                {objects.length === 0 && (
                    <p className="empty-text">No objects scanned yet.</p>
                )}

                {objects.map((object) => (
                    <button
                        key={object.id}
                        className="object-card"
                        onClick={() => onSelectObject(object)}
                    >
                        <img src={object.crop_url} alt={object.class_name} />

                        <div className="object-info">
                            <strong>{object.class_name}</strong>
                            <span>Confidence: {(object.confidence * 100).toFixed(1)}%</span>
                            <span>
                                X: {object.center.x} / Y: {object.center.y}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </aside>
    );
}