import Logo from "../assets/images/Logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "@/api/hooks/useAuth";

export default function Navbar() {
  const { isAuthed } = useAuth();
  
  return (
    <div className="navbar sticky top-0 z-50 bg-secondary text-secondary-content/95 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
      <Link className="navbar-start" to="/">
        <div className="navbar-start">
          <div className="px-2 gap-3 flex flex-row items-center cursor-pointer">
            <img src={Logo} alt="fuszerkomat.pl" className="h-12 w-auto object-contain" />
            <span className="hidden lg:flex text-xl tracking-[0.3em] font-marker text-accent"> FUSZERKOMAT.PL </span>
          </div>
        </div>
      </Link>

      <div className="navbar-center" />

      <div className="navbar-end gap-2">
        {isAuthed ? (
          <div className="flex items-center gap-4">

            <div className="rounded-full cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-7 h-7" >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
              </svg>
            </div>

            <div className="rounded-full cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>

            <div className="dropdown dropdown-end">
              <div className="avatar placeholder btn btn-ghost btn-circle border border-accent/60">
                <div className="bg-accent text-accent-content w-10 rounded-full font-bold">
                  <span>FK</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/login">
              <button className="btn btn-ghost btn-sm lg:btn-md whitespace-nowrap">Zaloguj się</button>
            </Link>
            <Link to="/register">
              <button className="btn btn-accent btn-sm lg:btn-md whitespace-nowrap">Zarejestruj się</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}