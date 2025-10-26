import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// @ts-expect-error No type definitions on css
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
