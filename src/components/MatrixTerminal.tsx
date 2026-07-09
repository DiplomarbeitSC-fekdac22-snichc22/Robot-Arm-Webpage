import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { DetectionObject } from "../types";

type MatrixTerminalProps = {
    selectedObject: DetectionObject | null;
};

type ArmCoordinates = {
    x: number;
    y: number;
    z: number;
    rotation: number;
};

function createArmCoordinates(object: DetectionObject): ArmCoordinates {
    return {
        x: Math.round(object.center.x / 4 + Math.random() * 12),
        y: Math.round(object.center.y / 4 + Math.random() * 12),
        z: Math.round(80 + Math.random() * 35),
        rotation: Math.round(-45 + Math.random() * 90),
    };
}

function createProgressBar(progress: number) {
    const total = 32;
    const filled = Math.round((progress / 100) * total);
    const empty = total - filled;

    return `[${"#".repeat(filled)}${"-".repeat(empty)}]`;
}

function randomMatrixLine() {
    const chars = "01#@$%&XYZ";
    let line = "";

    for (let i = 0; i < 46; i++) {
        line += chars[Math.floor(Math.random() * chars.length)];
    }

    return line;
}

export function MatrixTerminal({ selectedObject }: MatrixTerminalProps) {
    const [progress, setProgress] = useState(0);
    const [armCoordinates, setArmCoordinates] = useState<ArmCoordinates | null>(null);
    const [lines, setLines] = useState<string[]>([
        "╔══════════════════════════════════════════════════════╗",
        "║              PIA VISION TERMINAL v1.0                ║",
        "╚══════════════════════════════════════════════════════╝",
        "> system boot complete",
        "> camera stream online",
        "> yolo model ready",
        "> waiting for object selection...",
    ]);

    const terminalContentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!terminalContentRef.current) {
            return;
        }

        terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
    }, [lines]);

    useEffect(() => {
        if (!selectedObject) {
            setProgress(0);
            setArmCoordinates(null);
            return;
        }

        const coordinates = createArmCoordinates(selectedObject);
        setArmCoordinates(coordinates);
        setProgress(0);

        setLines([
            "╔══════════════════════════════════════════════════════╗",
            "║              OBJECT LOCALIZATION STARTED             ║",
            "╚══════════════════════════════════════════════════════╝",
            `> selected object: ${selectedObject.class_name}`,
            `> confidence: ${(selectedObject.confidence * 100).toFixed(1)}%`,
            `> image center: x=${selectedObject.center.x}, y=${selectedObject.center.y}`,
            "> calculating robot arm target coordinates...",
        ]);

        let currentProgress = 0;

        const interval = window.setInterval(() => {
            currentProgress += Math.floor(Math.random() * 6) + 2;

            if (currentProgress >= 100) {
                currentProgress = 100;
                window.clearInterval(interval);

                setLines((oldLines) => [
                    ...oldLines,
                    `> progress ${createProgressBar(100)} 100%`,
                    "> bounding box confirmed",
                    "> target locked",
                    `> arm target x=${coordinates.x}mm y=${coordinates.y}mm z=${coordinates.z}mm`,
                    `> gripper rotation=${coordinates.rotation}deg`,
                    "> ready for kinematics module",
                    "> awaiting movement confirmation...",
                ]);
            } else {
                setLines((oldLines) => [
                    ...oldLines,
                    `> progress ${createProgressBar(currentProgress)} ${currentProgress}%`,
                    `> scanning matrix: ${randomMatrixLine()}`,
                    `> estimated arm position x=${coordinates.x} y=${coordinates.y} z=${coordinates.z}`,
                ]);
            }

            setProgress(currentProgress);
        }, 180);

        return () => window.clearInterval(interval);
    }, [selectedObject]);

    return (
        <section className="terminal">
            <div className="terminal-header">
                <div className="terminal-title">
                    <span className="terminal-dot"></span>
                    <span>VISION TERMINAL</span>
                </div>

                <span>{progress}%</span>
            </div>

            <div className="terminal-body">
                <div className="terminal-content" ref={terminalContentRef}>
                    {lines.map((line, index) => (
                        <div key={`${line}-${index}`} className="terminal-line">
                            {line}
                        </div>
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
                            style={{ "--progress": `${progress}%` } as CSSProperties}
                        ></div>
                    </div>

                    <pre className="ascii-progress">
{createProgressBar(progress)}
                    </pre>

                    <div className="target-box">
                        <strong>
                            {selectedObject ? selectedObject.class_name : "No target selected"}
                        </strong>

                        {selectedObject && armCoordinates ? (
                            <>
                                <span>Confidence: {(selectedObject.confidence * 100).toFixed(1)}%</span>
                                <span>Image Center: X {selectedObject.center.x} / Y {selectedObject.center.y}</span>
                                <span>Arm X: {armCoordinates.x} mm</span>
                                <span>Arm Y: {armCoordinates.y} mm</span>
                                <span>Arm Z: {armCoordinates.z} mm</span>
                                <span>Rotation: {armCoordinates.rotation}°</span>
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