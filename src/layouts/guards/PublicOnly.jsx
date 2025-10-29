import { Navigate } from "react-router-dom";
import { useAuth } from "@/api/hooks/useAuth.js";
import Loading from "@/pages/loading/Loading";

export default function PublicOnly({ children }) {
  const { ready, isAuthed } = useAuth();

  if (!ready) {
    return <Loading />; 
  }

  return isAuthed ? <Navigate to="/" replace /> : children;
}