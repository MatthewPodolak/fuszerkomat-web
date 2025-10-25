import { useState } from "react";
import Fachura from "../../assets/images/Fachura.png";
import User from "../../assets/images/User.png";

export default function Register() {
  const [role, setRole] = useState(null);

  const FachuraDialog = 
  [ 
    "JAK Z FAKTURA TO WIADOMO ...",
    "BEZ PIWA TO SIE NIE RUSZAM",
    "JA TO ROBIE OD ’92",
    "TANIO, SZYBKO, DOBRZE – WYBIERZ DWA",
    "JAK MA DZIAŁAC TO BEDZIE, JAK NIE TO NIE",
    "TU POTRZEBA MOCNEJ CHEMII I SILNEJ WIARY",
    "JAK TO ZROBIE, TO SIE SAM ZDZIWIE"
   ];

  const UserDialog = 
  [
    "TYM RAZEM SIE UDA :) ", 
    "WIDZIALEM GORSZE NAPRAWY",
    "JAK NIE TEN, TO JUZ NIKT",
    "DROGI ALE ZA TO SREDNI"
  ];

  return (
    <div className={`w-full min-h-screen flex flex-col items-center justify-start bg-whitesmoke ${ !role ? "py-64" : "py-24" }`} >

        <div className="mb-12 text-center">
            {role === "fachowiec" ? (
                <p className="text-4xl font-marker tracking-widest text-primary">{FachuraDialog[Math.floor(Math.random() * FachuraDialog.length)]}</p>
            ) : role === "klient" ? (
                <p className="text-4xl font-marker tracking-widest text-primary">{UserDialog[Math.floor(Math.random() * UserDialog.length)]}</p>
            ) : (
                <p className="text-4xl font-marker tracking-widest text-base-content/70">CO CIE TUTAJ SPROWADZA?</p>
            )}
        </div>

        <div className="flex items-center justify-center gap-10 mb-10">

            <div onClick={() => setRole("fachowiec")} className={`cursor-pointer flex flex-col items-center transition-all duration-200 ${ role === "fachowiec" ? "scale-105" : "opacity-80 hover:opacity-100" }`}>
                <img src={Fachura} alt="Fachowiec" className={`w-40 h-40 rounded-full border-4 ${ role === "fachowiec" ? "border-primary shadow-lg" : "border-transparent" }`} />
                <p className={`mt-3 font-semibold ${role === "fachowiec" ? "text-primary" : "text-base-content/70" }`}>
                    Fachowiec
                </p>
            </div>

            <div onClick={() => setRole("klient")} className={`cursor-pointer flex flex-col items-center transition-all duration-200 ${ role === "klient" ? "scale-105" : "opacity-80 hover:opacity-100" }`} >
                <img src={User} alt="Klient" className={`w-40 h-40 rounded-full border-4 ${ role === "klient" ? "border-primary shadow-lg" : "border-transparent" }`} />
                <p className={`mt-3 font-semibold ${ role === "klient" ? "text-primary" : "text-base-content/70" }`}>
                    Klient
                </p>
            </div>
        </div>

        {role === "fachowiec" && (
        <div className="w-full max-w-3xl bg-base-100 p-6 rounded-xl shadow-md">
            <form className="flex flex-col gap-4">
            <div className="relative">
                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Nazwa firmy</p>
                <input type="text" className="input input-bordered w-full" />
            </div>

            <div className="relative">
                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Adres e-mail</p>
                <input type="email" className="input input-bordered w-full" />
            </div>

            <div className="relative">
                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Hasło</p>
                <input type="password" className="input input-bordered w-full" />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <input type="checkbox" className="checkbox checkbox-primary" />
                <span> Akceptuję <a href="#" className="text-primary underline hover:text-primary-focus">regulamin</a> serwisu </span>
            </label>

            <button className="btn btn-primary mt-2">Zarejestruj się</button>
            </form>
        </div>
        )}

        {role === "klient" && (
        <div className="w-full max-w-3xl bg-base-100 p-6 rounded-xl shadow-md">
            <form className="flex flex-col gap-4">
            <div className="relative">
                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Imię</p>
                <input type="text" className="input input-bordered w-full" />
            </div>

            <div className="relative">
                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Adres e-mail</p>
                <input type="email" className="input input-bordered w-full" />
            </div>

            <div className="relative">
                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Hasło</p>
                <input type="password" className="input input-bordered w-full" />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <input type="checkbox" className="checkbox checkbox-primary" />
                <span> Akceptuję <a href="#" className="text-primary underline hover:text-primary-focus">regulamin</a> serwisu</span>
            </label>

            <button className="btn btn-primary mt-2">Zarejestruj się</button>
            </form>
        </div>
        )}

      </div>
  );
}