import { useEffect, useState } from "react";
import type { DetectionObject } from "../types";

type MatrixTerminalProps = {
    selectedObject: DetectionObject | null;
};

export function MatrixTerminal({ selectedObject }: MatrixTerminalProps) {
    const [progress, setProgress] = useState(0);
    const [lines, setLines] = useState<string[]>([
        "> vision system initialized",
        "> camera stream online",
        "> waiting for object selection...",
    ]);

    useEffect(() => {
        if (!selectedObject) {
            return;
        }

        setProgress(0);
        setLines([
            "> object selected",
            `> target class: ${selectedObject.class_name}`,
            `> confidence: ${(selectedObject.confidence * 100).toFixed(1)}%`,
            "> starting object localization...",
        ]);

        let currentProgress = 0;

        const interval = window.setInterval(() => {
            currentProgress += Math.floor(Math.random() * 7) + 2;

            if (currentProgress >= 100) {
                currentProgress = 100;
                window.clearInterval(interval);

                setLines((oldLines) => [
                    ...oldLines.slice(-7),
                    "> progress: 100%",
                    "> bounding box confirmed",
                    "> target locked",
                    `> center coordinates: x=${selectedObject.center.x}, y=${selectedObject.center.y}`,
                ]);
            } else {
                setLines((oldLines) => [
                    ...oldLines.slice(-8),
                    `> progress: ${currentProgress}%`,
                ]);
            }

            setProgress(currentProgress);
        }, 110);

        return () => window.clearInterval(interval);
    }, [selectedObject]);

    return (
        <section className="terminal">
            <div className="terminal-header">
                <div className="terminal-title">
                    <span className="terminal-dot"></span>
                    <span>VISION STATUS TERMINAL</span>
                </div>

                <span>{progress}%</span>
            </div>

            <div className="terminal-body">
                <div className="terminal-content">
                    {lines.map((line, index) => (
                        <div key={index}>{line}</div>
                    ))}
                </div>

                <div className="terminal-progress-panel">
                    <div className="progress-label">
                        <span>Detection Progress</span>
                        <span>{progress}%</span>
                    </div>

                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ "--progress": `${progress}%` } as React.CSSProperties}
                        ></div>
                    </div>

                    <div className="target-box">
                        <strong>
                            {selectedObject ? selectedObject.class_name : "No target selected"}
                        </strong>

                        {selectedObject ? (
                            <>
                                <span>
                                    Confidence: {(selectedObject.confidence * 100).toFixed(1)}%
                                </span>
                                <span>
                                    Center: X {selectedObject.center.x} / Y {selectedObject.center.y}
                                </span>
                            </>
                        ) : (
                            <span>Click a detected object on the left side.</span>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}