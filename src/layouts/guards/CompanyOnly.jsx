import { Navigate } from "react-router-dom";
import { useAuth } from "@/api/hooks/useAuth.js";
import Loading from "@/pages/loading/Loading";

export default function UserOnly({ children }) {
  const { ready, isAuthed, claim } = useAuth();

  if (!ready) {
    return <Loading />; 
  }

  return (isAuthed && claim === "Company") ? children : <Navigate to="/" replace/>
}