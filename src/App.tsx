import { useState } from "react";
import "./App.css";

import { loadObjects } from "./api";
import type { DetectionObject } from "./types";
import { Navbar } from "./components/Navbar";
import { CameraGrid } from "./components/CameraGrid";
import { ObjectSidebar } from "./components/ObjectSidebar";
import { MatrixTerminal } from "./components/MatrixTerminal";

function App() {
  const [twoCameraMode, setTwoCameraMode] = useState(true);
  const [objects, setObjects] = useState<DetectionObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<DetectionObject | null>(null);
  const [loading, setLoading] = useState(false);

  async function refreshObjects() {
    try {
      setLoading(true);
      const loadedObjects = await loadObjects();
      setObjects(loadedObjects);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
              onToggleCameraMode={() => setTwoCameraMode(!twoCameraMode)}
          />

          <CameraGrid twoCameraMode={twoCameraMode} />

          <MatrixTerminal selectedObject={selectedObject} />
        </section>
      </main>
  );
}

export default App;