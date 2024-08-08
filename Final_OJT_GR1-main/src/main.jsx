import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./assets/style/Global.scss";
import { BrowserRouter } from "react-router-dom";
import './i18';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
