import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
        <main className="flex-1 w-full h-auto">
          <Outlet />
        </main>
      <Footer /> 
    </div>
  );
}