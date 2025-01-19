import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { resolveResource } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";

function App() {
  const [count, setCount] = useState(0);

  async function startWebUI() {
    const resourcePath = await resolveResource("Whisper-WebUI/start-webui.sh");
    const command = Command.create("sh", [resourcePath]);
    command.on("close", (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
    });
    command.on("error", (error) => console.error(`command error: "${error}"`));
    command.stdout.on("data", (line) =>
      console.log(`command stdout: "${line}"`)
    );
    command.stderr.on("data", (line) =>
      console.log(`command stderr: "${line}"`)
    );
    const child = await command.spawn();
    console.log("pid:", child.pid);
  }

  useEffect(() => {
    startWebUI();
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
