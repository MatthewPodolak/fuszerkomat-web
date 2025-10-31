import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import PublicOnly from "@/layouts/guards/PublicOnly.jsx";
import AuthOnly from "@/layouts/guards/PublicOnly.jsx";
import UserOnly from "@/layouts/guards/UserOnly.jsx";
import CompanyOnly from "@/layouts/guards/CompanyOnly.jsx";
import { hydrateTokenStore } from "@/api/tokenStore.js";
import { ToastProvider } from "@/context/ToastContext.jsx";
import GlobalErrorCatcher from "@/helpers/GlobalErrorCatcher.jsx";
import "./index.css";

import Loading from "./pages/loading/Loading";

hydrateTokenStore();

const Error = lazy(() => import("./pages/error/Error"));
const Home = lazy(() => import("./pages/Home"));
const Category = lazy(() => import("./pages/Category"));

const Register = lazy(() => import("./pages/auth/Register"));
const Login = lazy(() => import("./pages/auth/Login"));

const UserDashboard = lazy(() => import("./pages/user/UserDashboard"));
const CompanyDashboard = lazy(() => import("./pages/company/CompanyDashboard"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RootLayout><Error /></RootLayout>,
    children: [
      { index: true, element: <Home /> },
      { path: "category/:category", element: <Category /> },
      { path: "register", element: <PublicOnly><Register /></PublicOnly> },
      { path: "login",    element: <PublicOnly><Login /></PublicOnly> },
      { path: "/user/dashboard", element: <UserOnly><UserDashboard /></UserOnly>},
      { path: "/company/dashboard", element: <CompanyOnly><CompanyDashboard /></CompanyOnly>}
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <GlobalErrorCatcher>
        <Suspense fallback={<Loading/>}> 
          <RouterProvider router={router} />
        </Suspense>
      </GlobalErrorCatcher>
    </ToastProvider>
  </React.StrictMode>
);