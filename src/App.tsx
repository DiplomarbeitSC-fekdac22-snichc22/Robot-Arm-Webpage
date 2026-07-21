import { useState } from "react";
import "./App.css";

import { loadObjects } from "./api";
import type { DetectionObject } from "./types";
import { Navbar } from "./components/Navbar";
import { CameraGrid } from "./components/CameraGrid";
import { ObjectSidebar } from "./components/ObjectSidebar";
import { MatrixTerminal } from "./components/MatrixTerminal";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

function App() {
  const [twoCameraMode, setTwoCameraMode] =
      useState(true);

  const [objects, setObjects] = useState<
      DetectionObject[]
  >([]);

  const [selectedObject, setSelectedObject] =
      useState<DetectionObject | null>(null);

  const [loading, setLoading] = useState(false);

  const [backendError, setBackendError] =
      useState<string | null>(null);

  const [cameraError, setCameraError] =
      useState<string | null>(null);

  const visibleError = cameraError ?? backendError;

  async function refreshObjects() {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setBackendError(null);

      const loadedObjects = await loadObjects();

      setObjects(loadedObjects);

      if (loadedObjects.length === 0) {
        setSelectedObject(null);
        setBackendError("No objects detected");
      }
    } catch (error) {
      console.error("Could not load objects:", error);

      // Remove stale detections so they cannot accidentally
      // be used for robot movement.
      setObjects([]);
      setSelectedObject(null);
      setBackendError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function dismissError() {
    setBackendError(null);
    setCameraError(null);
  }

  return (
      <main className="app-shell">
        <ObjectSidebar
            objects={objects}
            loading={loading}
            onRefresh={refreshObjects}
            onSelectObject={setSelectedObject}
        />

        <section className="main-area">
          <Navbar
              twoCameraMode={twoCameraMode}
              onToggleCameraMode={() =>
                  setTwoCameraMode((current) => !current)
              }
          />

          {visibleError && (
              <div
                  className="error-banner"
                  role="alert"
                  aria-live="assertive"
              >
                <div>
                  <strong>System warning</strong>
                  <span>{visibleError}</span>
                </div>

                <button
                    type="button"
                    className="error-dismiss"
                    onClick={dismissError}
                    aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
          )}

          <CameraGrid
              twoCameraMode={twoCameraMode}
              onCameraError={setCameraError}
          />

          <MatrixTerminal
              selectedObject={selectedObject}
          />
        </section>
      </main>
  );
}

export default App;