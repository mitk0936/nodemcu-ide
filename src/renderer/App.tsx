import { useEffect, useState } from "react";
import IdeLayout from "./features/layout/components/IdeLayout";
import { Toaster } from "./components/ui/toaster";

function App() {
  const [count, setCount] = useState(0);

  // window.api.on("tick", (d) => d);
  // window.api.once("tick", console.log);

  useEffect(() => {
    window.api.on("tick", ([d]) => {
      setCount(Number(d));
    });

    document.body.style.userSelect = "none";
  }, []);

  return (
    <>
      <IdeLayout />
      <Toaster />
    </>
  );
}

export default App;
