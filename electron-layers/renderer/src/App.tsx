import { useEffect } from "react";
import IdeLayout from "./features/layout/components/IdeLayout";
import { Toaster } from "./components/ui/toaster";

function App() {
  useEffect(() => {
    document.body.style.userSelect = "none";

    // Disconnect any boards on app mount, handle case with cleanup on renderer restart,
    // An issue with hot reload and board connection state
    window.api.disconnectBoard();
  }, []);

  return (
    <>
      <IdeLayout />
      <Toaster />
    </>
  );
}

export default App;
