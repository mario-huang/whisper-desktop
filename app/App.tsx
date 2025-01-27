import { LoaderPinwheel } from "lucide-react";
import "./App.css";
import { useWhisper } from "./whisper";

function App() {
  // const info = useWhisper();

  return (
    <div className="flex flex-col gap-8 justify-center items-center h-screen text-orange-200  bg-orange-600">
      <LoaderPinwheel className="size-40 animate-spin" />
      {/* <p className="text-2xl whitespace-pre text-center">{info}</p> */}
    </div>
  );
}

export default App;
