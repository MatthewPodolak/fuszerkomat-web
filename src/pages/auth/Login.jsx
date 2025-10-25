export default function Login() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-whitesmoke px-4 sm:px-6">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.5)] bg-primary">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest font-marker text-accent text-center mb-4 sm:mb-6">Zaloguj sie</h1>
        <form className="flex flex-col gap-3 sm:gap-4">
          <div className="relative">
            <p className="absolute -top-2 left-3 bg-primary text-xs sm:text-sm px-1 text-accent z-10">Adres e-mail</p>
            <input type="email" autoComplete="email" className="input w-full bg-primary text-accent border-accent placeholder-accent/60 focus:outline-none focus:border-accent-focus" />
          </div>
          <div className="relative">
            <p className="absolute -top-2 left-3 bg-primary text-xs sm:text-sm px-1 text-accent z-10">Hasło</p>
            <input type="password" autoComplete="current-password" className="input w-full bg-primary text-accent border-accent placeholder-accent/60 focus:outline-none focus:border-accent-focus" />
          </div>
          <button className="btn btn-accent mt-2 sm:mt-4 w-full">Zaloguj się</button>
        </form>
        <p className="text-accent text-xs sm:text-sm text-center mt-3 sm:mt-4">Zapomniales hasla? <a className="underline hover:text-accent-focus cursor-pointer">Zresetuj.</a></p>
      </div>
    </div>
  );
}