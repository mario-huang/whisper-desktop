import { useEffect } from "react";
import "./App.css";
import { Whisper } from "./whisper";

function App() {

  useEffect(() => {
    const whisper = new Whisper();
    whisper.start();
    return () => {
      whisper.stop();
    };
  }, []);

  return (
    <>
      
    </>
  );
}

export default App;
