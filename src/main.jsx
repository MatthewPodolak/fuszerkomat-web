import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import PublicOnly from "@/layouts/guards/PublicOnly.jsx";
import AuthOnly from "@/layouts/guards/PublicOnly.jsx";
import { hydrateTokenStore } from "@/api/tokenStore.js";
import { ToastProvider } from "@/context/ToastContext.jsx";
import GlobalErrorCatcher from "@/helpers/GlobalErrorCatcher.jsx";
import "./index.css";

hydrateTokenStore();

const Home = lazy(() => import("./pages/Home"));
const Category = lazy(() => import("./pages/Category"));
const Error = lazy(() => import("./pages/error/Error"));

const Register = lazy(() => import("./pages/auth/Register"));
const Login = lazy(() => import("./pages/auth/Login"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      { path: "category/:category", element: <Category /> },
      { path: "register", element: <PublicOnly><Register /></PublicOnly> },
      { path: "login",    element: <PublicOnly><Login /></PublicOnly> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <GlobalErrorCatcher>
        <Suspense fallback={<div>Ładowanie…</div>}> 
          <RouterProvider router={router} />
        </Suspense>
      </GlobalErrorCatcher>
    </ToastProvider>
  </React.StrictMode>
);