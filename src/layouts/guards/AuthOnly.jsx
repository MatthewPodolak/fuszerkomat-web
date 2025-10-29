import { Navigate } from "react-router-dom";
import { useAuth } from "@/api/hooks/useAuth.js";

export default function AuthOnly({ children }) {
  const { ready, isAuthed } = useAuth();

  if (!ready) {
    return null; //TODO LOADING COMP
  }

  return isAuthed ? children : <Navigate to="/login" replace />;
}