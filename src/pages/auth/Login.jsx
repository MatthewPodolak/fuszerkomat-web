import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { AuthService } from "@/api/services/AuthService";
import { useMutation } from "@/api/hooks/useMutation";

import ActivityIndicator from "../../components/ActivityIndicator";

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    msg: null,
    type: null //pswd email both.
  });
  const { mutate: login } = useMutation(
    (vars, ctx) => AuthService.login(vars.email, vars.password, ctx)
  );

  const loginReq = async () => {
    setIsLoading(true);
    clearError();
    if(!email.trim() && !password.trim()){ setError({msg: "W ten sposób się nie uda! Wypełnij oba pola", type: "both"}); setIsLoading(false); return; }
    if(!email.trim()){ setError({msg: "E-mail będzie w tym potrzeby...", type: "email"}); setIsLoading(false); return; }
    if(!password.trim()){ setError({msg: "Hasło się przyda!", type: "pswd"}); setIsLoading(false); return; }

    const res = await login({ email, password }, { onFinally: () => setIsLoading(false) })
    if (res.aborted) return;

    if(res.status === 200){
      showToast("Witamy z powrotem!", "success");
      navigate("/");
      return;
    }

    if(res.errors[0]?.code === "NotFound" || res.status === 404){
      setError({msg: "Podany użytkownik nie istnieje", type: "email"});
      return;
    }

    if(res.errors[0]?.code === "Unauthorized" || res.status === 401){
      setError({msg: "Nieprawidłowe hasło", type: "pswd"});
      return;
    }
  };

  const clearError = useCallback(() => setError({ msg: null, type: null }), []);
  
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-whitesmoke px-4 sm:px-6 relative overflow-hidden">
      <p className="hidden xl:block absolute text-secondary font-marker text-[1056px] top-[-40%] left-10 2xl:top-[-40%] 2xl:left-30 z-1">X</p>
      <p className="hidden xl:block absolute text-secondary font-marker text-[1056px] bottom-[-80%] 2xl:bottom-[-70%] right-5 z-1">3</p>
      <div className="w-full min-h-80 max-w-sm sm:max-w-md md:max-w-2xl z-2 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.5)] bg-primary">
        {isLoading ? (
          <>
            <div className="w-full h-70 flex items-center justify-center">
              <ActivityIndicator size="medium" />
            </div>
          </>
        ):(
          <>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest font-marker text-accent text-center mb-4 sm:mb-6">Zaloguj sie</h1>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative">
                <p className="absolute -top-2 left-3 bg-primary text-xs sm:text-sm px-1 text-accent z-10">Adres e-mail</p>
                <input value={email} onChange={(e) => {setEmail(e.target.value); clearError();}} type="email" autoComplete="email" className={`input w-full bg-primary text-accent placeholder-accent/60 focus:outline-none ${
                    error.type === "email" || error.type === "both"
                      ? "border-red-500 focus:border-red-500"
                      : "border-accent focus:border-accent-focus"
                  }`} 
                />
              </div>
              <div className="relative">
                <p className="absolute -top-2 left-3 bg-primary text-xs sm:text-sm px-1 text-accent z-10">Hasło</p>
                <input value={password} onChange={(e) => {setPassword(e.target.value); clearError();}} type="password" autoComplete="current-password" className={`input w-full bg-primary text-accent placeholder-accent/60 focus:outline-none ${
                    error.type === "pswd" || error.type === "both"
                      ? "border-red-500 focus:border-red-500"
                      : "border-accent focus:border-accent-focus"
                  }`} 
                />
              </div>
              {error.msg && (
                <p className="text-red-500 tracking-wider text-center mt-3">{error.msg}</p>
              )}
              <button onClick={() => loginReq()} className="btn btn-accent mt-2 sm:mt-4 w-full">Zaloguj się</button>
            </div>
            <p className="text-accent text-xs sm:text-sm text-center mt-3 sm:mt-4">Zapomniales hasla? <a className="underline hover:text-accent-focus cursor-pointer">Zresetuj.</a></p>
          </>
        )}       
      </div>
    </div>
  );
}