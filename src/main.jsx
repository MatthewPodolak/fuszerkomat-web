import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import "./index.css";

const Home = lazy(() => import("./pages/Home"));
const Error = lazy(() => import("./pages/error/Error"));

const Register = lazy(() => import("./pages/auth/Register"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      { path: "register", element: <Register /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={<div>Ładowanie…</div>}> 
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);