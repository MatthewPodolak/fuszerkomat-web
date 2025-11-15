import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast  } from "@/context/ToastContext";
import { AuthService } from "@/api/services/AuthService";
import { useMutation } from "@/api/hooks/useMutation";

import dialogs from "@/data/RegisterDialog.json";
import ActivityIndicator from "../../components/ActivityIndicator";
import Fachura from "../../assets/images/Fachura.png";
import User from "../../assets/images/User.png";

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
    
  const [dialogLine, setDialogLine] = useState("");
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestData, setRequestData] = useState({
    name: "",
    email: "",
    password: "",
    accepted: false
  });
  const [error, setError] = useState({
    msg: null,
    type: null, //all name email pswd acc
  });
  const { mutate: register } = useMutation(
    (vars, ctx) => AuthService.register(vars.email, vars.password, vars.accountType, vars.userName, vars.companyName, ctx)
  );

  const registerReq = async () => {
    setIsLoading(true);
    const { name, email, password, accepted } = requestData;

    if(!name || !email || !password){ setError({msg: "Proszę wypełnij wszystkie pola"}); setIsLoading(false); return; }
    if(!accepted){ setError({msg: "Akceptacja regulaminu jest obowiązkowa", type: "acc"}); setIsLoading(false); return }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) { setError({ msg: "Podaj poprawny adres e-mail", type: "email" }); setIsLoading(false); return; }

    const passOk = /^(?=.*[A-Za-z])(?=.*\d).{7,}$/.test(password);
    if (!passOk) { setError({ msg: "Hasło powinno zawierać minimum 7 liter znak oraz cyfrę", type: "pswd" }); setIsLoading(false); return; }

    const companyName = role === "fachowiec" ? name : null;
    const userName = role === "fachowiec" ? null : name;
    const accountType = role === "fachowiec" ? "Company" : "User";

    const res = await register({ email, password, accountType, userName, companyName }, { onFinally: () => setIsLoading(false) })
    if (res.aborted) return;

    if(res.status === 200){
      showToast("Konto założone poprawnie", "success");
      navigate("/");
      return;
    }

    if(res.status === 409){
      setError({msg: "Konto z tym adresem e-mail już istnieje.", type: "email"});
      return;
    }

    if(res.status === 500 || res.status === 400){
      showToast("Upss... coś poszło nie tak", "error");
      return;
    }
  };

  const clearError = useCallback(() => setError({ msg: null, type: null }), []);
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
  useEffect(() => {
    if (role === "fachowiec") {
        setDialogLine(pickRandom(dialogs.FachuraDialog));
    } else if (role === "klient") {
        setDialogLine(pickRandom(dialogs.UserDialog));
    } else {
        setDialogLine("");
    }
  }, [role]);

  return (
    <div className={`w-full min-h-screen flex flex-col items-center justify-start bg-whitesmoke ${ !role ? "py-64" : "py-24" }`} >

        <div className="mb-12 text-center">
            {role ? (
                <p className="text-2xl xl:text-4xl font-marker tracking-widest text-primary">{dialogLine}</p>
            ) : (
                <p className="text-2xl xl:text-4xl font-marker tracking-widest text-base-content/70"> CO CIE TUTAJ SPROWADZA? </p>
            )}
        </div>

        <div className="flex items-center justify-center gap-10 mb-10">

            <div onClick={() => {setRole("fachowiec"); setRequestData({name: null}); clearError();}} className={`cursor-pointer flex flex-col items-center transition-all duration-200 ${ role === "fachowiec" ? "scale-105" : "opacity-80 hover:opacity-100" }`}>
                <img src={Fachura} alt="Fachowiec" className={`w-30 h-30 xl:w-40 xl:h-40 rounded-full border-4 ${ role === "fachowiec" ? "border-primary shadow-lg" : "border-transparent" }`} />
                <p className={`mt-3 font-semibold ${role === "fachowiec" ? "text-primary" : "text-base-content/70" }`}>
                    Fachowiec
                </p>
            </div>

            <div onClick={() => {setRole("klient"); setRequestData({name: null}); clearError();}} className={`cursor-pointer flex flex-col items-center transition-all duration-200 ${ role === "klient" ? "scale-105" : "opacity-80 hover:opacity-100" }`} >
                <img src={User} alt="Klient" className={`w-30 h-30 xl:w-40 xl:h-40 rounded-full border-4 ${ role === "klient" ? "border-primary shadow-lg" : "border-transparent" }`} />
                <p className={`mt-3 font-semibold ${ role === "klient" ? "text-primary" : "text-base-content/70" }`}>
                    Klient
                </p>
            </div>
        </div>
        <div className={`w-full max-w-3xl bg-base-100 rounded-xl shadow-md ${role ? "p-6" : "p-0"}`}>
            {isLoading ? (
                <>
                    <ActivityIndicator size="medium" />
                </>
            ):(
                <>
                    {role === "fachowiec" && (
                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Nazwa firmy</p>
                                <input onChange={(e) => {setRequestData(prev => ({ ...prev, name: e.target.value })); clearError();}} type="text" className="input input-bordered w-full" />
                            </div>

                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Adres e-mail</p>
                                <input onChange={(e) => {setRequestData(prev => ({ ...prev, email: e.target.value })); clearError();}} type="email" className={`input input-bordered w-full ${error?.type === 'email' || error?.type === 'all' ? 'border-red-500' : ''}`} />
                            </div>

                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Hasło</p>
                                <input onChange={(e) => {setRequestData(prev => ({ ...prev, password: e.target.value })); clearError();}} type="password" className={`input input-bordered w-full ${error?.type === 'pswd' || error?.type === 'all' ? 'border-red-500' : ''}`}/>
                            </div>

                            <label className={`flex items-center gap-2 text-sm mt-1 ${error.type === "acc" ? "text-red-500" : "text-gray-600"}`}>
                                <input type="checkbox" className={`checkbox ${error.type === "acc" ? "checkbox-error" : "checkbox-primary"}`} onChange={(e) => { setRequestData(prev => ({ ...prev, accepted: e.target.checked })); clearError(); }} />
                                <span>Akceptuję <a href="#" className={`${error.type === "acc" ? "text-red-500 hover:text-red-600" : "text-primary hover:text-primary-focus"} underline`}>regulamin</a> serwisu *</span>
                            </label>

                            <button onClick={() => registerReq()} className="btn btn-primary mt-2">Zarejestruj się</button>
                            {error.msg && (
                                <p className="text-red-500 tracking-wider text-center mt-3">{error.msg}</p>
                            )}
                        </div>
                    )}

                    {role === "klient" && (
                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Imię</p>
                                <input onChange={(e) => {setRequestData(prev => ({ ...prev, name: e.target.value })); clearError();}} type="text" className="input input-bordered w-full" />
                            </div>

                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Adres e-mail</p>
                                <input onChange={(e) => {setRequestData(prev => ({ ...prev, email: e.target.value })); clearError();}} type="email" className={`input input-bordered w-full ${error?.type === 'email' || error?.type === 'all' ? 'border-red-500' : ''}`} />
                            </div>

                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Hasło</p>
                                <input onChange={(e) => {setRequestData(prev => ({ ...prev, password: e.target.value })); clearError();}} type="password" className={`input input-bordered w-full ${error?.type === 'pswd' || error?.type === 'all' ? 'border-red-500' : ''}`} />
                            </div>

                            <label className={`flex items-center gap-2 text-sm mt-1 ${error.type === "acc" ? "text-red-500" : "text-gray-600"}`}>
                                <input type="checkbox" className={`checkbox ${error.type === "acc" ? "checkbox-error" : "checkbox-primary"}`} onChange={(e) => { setRequestData(prev => ({ ...prev, accepted: e.target.checked })); clearError(); }} />
                                <span>Akceptuję <a href="#" className={`${error.type === "acc" ? "text-red-500 hover:text-red-600" : "text-primary hover:text-primary-focus"} underline`}>regulamin</a> serwisu *</span>
                            </label>

                            <button onClick={() => registerReq()} className="btn btn-primary mt-2">Zarejestruj się</button>
                            {error.msg && (
                                <p className="text-red-500 tracking-wider text-center mt-3">{error.msg}</p>
                            )}
                        </div>
                    )}
                </>
            )}        
        </div>

      </div>
  );
}