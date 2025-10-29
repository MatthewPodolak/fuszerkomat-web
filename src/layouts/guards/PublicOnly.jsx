import { Navigate } from "react-router-dom";
import { useAuth } from "@/api/hooks/useAuth.js";

export default function PublicOnly({ children }) {
  const { ready, isAuthed } = useAuth();

  if (!ready) {
    return null; //TODO LOADING COMP
  }

  return isAuthed ? <Navigate to="/" replace /> : children;
}