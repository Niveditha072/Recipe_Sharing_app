import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { RecipeProvider } from "./context/RecipeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RecipeProvider>
      <App />
    </RecipeProvider>
  </React.StrictMode>
);
