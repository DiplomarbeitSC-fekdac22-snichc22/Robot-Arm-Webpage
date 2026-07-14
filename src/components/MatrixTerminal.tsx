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

type LogTone = "default" | "dim" | "accent";

type LogEntry = {
    id: number;
    text: string;
    tone: LogTone;
};

let logEntrySequence = 0;

function nextLogId() {
    logEntrySequence += 1;
    return logEntrySequence;
}

function timestamp() {
    const now = new Date();
    const time = now.toTimeString().slice(0, 8);
    const ms = String(now.getMilliseconds()).padStart(3, "0");
    return `${time}.${ms}`;
}

function logLine(
    level: "INFO" | "DEBUG" | "WARN",
    module: string,
    message: string,
    tone: LogTone = "default"
): LogEntry {
    return {
        id: nextLogId(),
        text: `[${timestamp()}] ${level.padEnd(5)} ${module}: ${message}`,
        tone,
    };
}

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

export function MatrixTerminal({ selectedObject }: MatrixTerminalProps) {
    const [progress, setProgress] = useState(0);
    const [armCoordinates, setArmCoordinates] = useState<ArmCoordinates | null>(null);
    const [logLines, setLogLines] = useState<LogEntry[]>(() => [
        logLine("INFO", "system", "boot complete"),
        logLine("INFO", "camera", "stream online"),
        logLine("INFO", "yolo", "model loaded, ready for inference"),
    ]);
    const [statusLine, setStatusLine] = useState<string | null>(null);

    const terminalContentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!terminalContentRef.current) {
            return;
        }

        terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
    }, [logLines, statusLine]);

    useEffect(() => {
        if (!selectedObject) {
            setProgress(0);
            setArmCoordinates(null);
            setStatusLine(null);
            return;
        }

        const coordinates = createArmCoordinates(selectedObject);
        setArmCoordinates(coordinates);
        setProgress(0);

        setLogLines((prev) => [
            ...prev,
            logLine(
                "INFO",
                "pipeline",
                `localization started for "${selectedObject.class_name}"`
            ),
            logLine(
                "INFO",
                "detector",
                `object=${selectedObject.class_name} confidence=${(selectedObject.confidence * 100).toFixed(1)}%`
            ),
            logLine(
                "DEBUG",
                "detector",
                `bbox_center=(${selectedObject.center.x}, ${selectedObject.center.y})`,
                "dim"
            ),
            logLine("INFO", "kinematics", "solving inverse kinematics for target pose"),
        ]);

        let currentProgress = 0;
        let iteration = 0;
        const startResidual = 0.4 + Math.random() * 0.3;

        setStatusLine(`${createProgressBar(0)} 0%`);

        const interval = window.setInterval(() => {
            currentProgress = Math.min(100, currentProgress + Math.floor(Math.random() * 6) + 2);
            iteration += 1;

            if (currentProgress >= 100) {
                window.clearInterval(interval);

                setProgress(100);
                setStatusLine(null);
                setLogLines((prev) => [
                    ...prev,
                    logLine(
                        "INFO",
                        "kinematics",
                        `converged after ${iteration} iterations (residual < 1e-3)`,
                        "accent"
                    ),
                    logLine(
                        "INFO",
                        "kinematics",
                        `arm_target=(${coordinates.x}, ${coordinates.y}, ${coordinates.z}) mm`,
                        "accent"
                    ),
                    logLine("INFO", "kinematics", `gripper_rotation=${coordinates.rotation}deg`),
                    logLine(
                        "INFO",
                        "planner",
                        "trajectory ready, awaiting movement confirmation",
                        "accent"
                    ),
                ]);
                return;
            }

            setProgress(currentProgress);

            if (iteration % 3 === 0) {
                const residual = startResidual * (1 - currentProgress / 100);
                setLogLines((prev) => [
                    ...prev,
                    logLine(
                        "DEBUG",
                        "kinematics",
                        `iteration ${iteration}, residual=${residual.toFixed(4)}`,
                        "dim"
                    ),
                ]);
            }

            setStatusLine(`${createProgressBar(currentProgress)} ${currentProgress}%`);
        }, 180);

        return () => window.clearInterval(interval);
    }, [selectedObject]);

    return (
        <section className="terminal">
            <div className="terminal-header">
                <div className="terminal-title">
                    <span>VISION TERMINAL</span>
                </div>

                <span>{progress}%</span>
            </div>

            <div className="terminal-body">
                <div className="terminal-content" ref={terminalContentRef}>
                    {logLines.map((line) => (
                        <div
                            key={line.id}
                            className={
                                line.tone === "default"
                                    ? "terminal-line"
                                    : `terminal-line ${line.tone}`
                            }
                        >
                            {line.text}
                        </div>
                    ))}

                    {statusLine && <div className="terminal-line dim">{statusLine}</div>}
                </div>

                <div className="terminal-progress-panel">
                    <div className="progress-label">
                        <span>Localization progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ "--progress": `${progress}%` } as CSSProperties}
                        />
                    </div>

                    <div className="target-box">
                        <strong>
                            {selectedObject ? selectedObject.class_name : "No target selected"}
                        </strong>

                        {selectedObject && armCoordinates ? (
                            <>
                                <span>
                                    Confidence: {(selectedObject.confidence * 100).toFixed(1)}%
                                </span>
                                <span>
                                    Image Center: X {selectedObject.center.x} / Y {selectedObject.center.y}
                                </span>
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