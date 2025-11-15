import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="w-full h-48 bg-accent relative overflow-hidden">
      <div className="absolute left-6 top-6 z-10 flex items-center gap-3 text-sm">
        <p className="text-base-content/70">
          © {new Date().getFullYear()} FUSZERKOMAT. All rights reserved.
        </p>
        <Link to="/login" className="btn btn-sm btn-ghost">Zaloguj się</Link>
        <Link to="/register" className="btn btn-sm btn-outline">Załóż konto</Link>
      </div>

      <div className="absolute right-6 top-6 z-10 flex gap-2">
        <a aria-label="Instagram" href="#" className="btn btn-ghost btn-circle btn-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current">
            <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.5"></rect>
            <circle cx="12" cy="12" r="4" strokeWidth="1.5"></circle>
            <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor"></circle>
          </svg>
        </a>
        <a aria-label="Facebook" href="#" className="btn btn-ghost btn-circle btn-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current">
            <path d="M14.5 8h2V5.5h-2c-2 0-3.5 1.6-3.5 3.6V11H9v2.5h2v5h2.5v-5H16L16.5 11H13v-1.9c0-.7.5-1.1 1.5-1.1Z" fill="currentColor"></path>
          </svg>
        </a>
        <a aria-label="TikTok" href="#" className="btn btn-ghost btn-circle btn-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current">
            <path d="M14.5 5.5c.7 1.5 2.2 3 4.5 3.3v2.3c-1.8-.1-3.4-.8-4.5-1.8v5.9a5 5 0 1 1-2.5-4.3v2.6a2.5 2.5 0 1 0 0 3.6V5.5h2.5Z" fill="currentColor"></path>
          </svg>
        </a>
      </div>

      <p className="absolute bottom-[-60%] text-[206px] tracking-[0.15em] font-marker"> FUSZERKOMAT </p>
    </div>
  );
}
