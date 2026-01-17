import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/api/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { AuthService } from "@/api/services/AuthService";
import { UserTaskService } from "@/api/services/UserTaskService";
import { useMutation } from "@/api/hooks/useMutation";

import ActivityIndicator from "@/components/ActivityIndicator";
import LocationPicker from "@/components/LocationPicker";
import categories from "../data/Categories.json";

const EMPTY_QUEST = {
  name: null,
  desc: null,
  maxPrice: null,
  expRelTime: null,
  location: { name: null, long: null, lat: null },
  category: null,
  tags: [],
  files: [],
};

const EMPTY_REG = {
  name: "",
  email: "",
  password: "",
  accepted: false,
};

const STEPS = ["Opis", "Zdjęcia", "Termin", "Lokalizacja", "Kategoria", "Budżet"];

const TIME_OPTIONS = [
  { value: "Asap", label: "Jak najszybciej" },
  { value: "ThisWeek", label: "W ciągu tygodnia" },
  { value: "TwoWeeks", label: "W ciągu dwóch tygodni" },
  { value: "Adaptive", label: "Dostosuję się" },
];

const BUDGET_OPTIONS = [
  { value: null, label: "Nie chcę podawać" },
  { value: 999, label: "Do 1000 zł" },
  { value: 4999, label: "1000 - 5000 zł" },
  { value: 9999, label: "5000 - 10000 zł" },
];

const Stepper = ({ progress }) => (
  <div className="flex items-center justify-center gap-1 w-full px-8 py-4">
    {STEPS.map((step, i) => (
      <div key={i} className="flex items-center gap-1 flex-1 last:flex-none">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0 ${i < progress ? "bg-accent text-accent-content shadow-lg shadow-accent/25" : i === progress ? "bg-primary text-primary-content ring-4 ring-primary/20 shadow-lg shadow-primary/30 scale-110" : "bg-base-200 text-base-content/40"}`}>
          {i < progress ? "✓" : ``}
        </div>
        {i < STEPS.length - 1 && (
          <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${i < progress ? "bg-accent" : "bg-base-200"}`} />
        )}
      </div>
    ))}
  </div>
);

const StepHeader = ({ title, subtitle }) => (
  <div className="text-center mb-8">
    <h2 className="text-3xl font-marker tracking-widest text-base-content">{title}</h2>
    {subtitle && <p className="text-base-content/60 mt-4 max-w-lg mx-auto">{subtitle}</p>}
  </div>
);

const NavButtons = ({ progress, canProceed = true, nextLabel = "Dalej", onNext, onBack }) => (
  <div className="flex justify-center gap-3 mt-8 pt-6 border-t border-base-200">
    {progress > 0 && (
      <button onClick={onBack} className="btn btn-ghost gap-2 px-6">
        Cofnij
      </button>
    )}
    <button onClick={onNext} disabled={!canProceed} className={`btn gap-2 px-8 transition-all duration-200 ${canProceed ? "btn-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]" : "btn-disabled bg-base-200 text-base-content/30"}`}>
      {nextLabel}
    </button>
  </div>
);

const OptionCard = ({ selected, onClick, label }) => (
  <div onClick={onClick} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] ${selected ? "border-accent bg-accent/10 shadow-md shadow-accent/10" : "border-primary/30 hover:border-primary bg-base-100"}`}>
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <p className={`font-semibold ${selected ? "text-accent" : ""}`}>{label}</p>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected ? "border-accent bg-accent" : "border-primary/30"}`}>
        {selected && (
          <svg className="w-4 h-4 text-accent-content" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  </div>
);

const FloatingInput = ({ label, type = "text", value, onChange, error: inputError, ...props }) => (
  <div className="relative group">
    <input type={type} value={value} onChange={onChange} placeholder=" " className={`peer w-full px-4 pt-6 pb-2 rounded-xl border-2 bg-base-100 outline-none transition-all duration-200 focus:border-accent focus:ring-4 focus:ring-accent/10 ${inputError ? "border-error" : "border-primary/30 hover:border-primary"}`} {...props} />
    <label className="absolute left-4 top-4 text-base-content/50 transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs">
      {label}
    </label>
  </div>
);

const FloatingTextarea = ({ label, value, onChange, rows = 5, ...props }) => (
  <div className="relative group">
    <textarea value={value} onChange={onChange} placeholder=" " rows={rows} className="peer w-full px-4 pt-6 pb-3 rounded-xl border-2 border-primary/30 bg-base-100 outline-none transition-all duration-200 resize-none focus:border-accent focus:ring-4 focus:ring-accent/10 hover:border-primary" {...props} />
    <label className="absolute left-4 top-4 text-base-content/50 transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs">
      {label}
    </label>
  </div>
);

export default function Questionary({ open = false, onClose, pre = null }) {
  const { isAuthed } = useAuth();
  const { showToast } = useToast();

  const panelRef = useRef(null);
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [questData, setQuestData] = useState(EMPTY_QUEST);
  const [regData, setRegData] = useState(EMPTY_REG);
  const [slideDirection, setSlideDirection] = useState("right");
  const [error, setError] = useState({
    msg: null,
    type: null,
  });

  const clearError = useCallback(() => setError({ msg: null, type: null }), []);

  const { mutate: register } = useMutation((vars, ctx) =>
    AuthService.register(vars.email, vars.password, vars.accountType, vars.userName, vars.companyName, ctx)
  );
  const { mutate: publishTask } = useMutation((vars, ctx) => UserTaskService.publishTask(vars, ctx));

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  useEffect(() => {
    if (!pre || !open) return;
    setQuestData((prev) => ({
      ...prev,
      category: pre.cat ?? prev.category,
      tags: pre.tag ? [pre.tag] : prev.tags,
    }));
  }, [pre, open]);

  if (!open) return null;

  const goNext = () => {
    setSlideDirection("right");
    setProgress((p) => p + 1);
  };

  const goBack = () => {
    setSlideDirection("left");
    setProgress((p) => p - 1);
  };

  const handleFiles = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (!fileList.length) return;

    if (fileList.length + questData.files.length > 5) {
      setFileError("Możesz dodać maksymalnie 5 obrazków.");
      return;
    }

    const items = await Promise.all(
      fileList.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const url = URL.createObjectURL(file);
        return {
          id: crypto.randomUUID(),
          url,
          bytes,
        };
      })
    );

    setQuestData((prev) => ({
      ...prev,
      files: [...prev.files, ...items],
    }));
    setFileError(null);
    e.target.value = "";
  };

  const removeFile = (id) => {
    setQuestData((prev) => {
      const toRemove = prev.files.find((f) => f.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.url);
      return { ...prev, files: prev.files.filter((f) => f.id !== id) };
    });
  };

  const publish = async (withRegister = false) => {
    setIsLoading(true);
    if (withRegister) {
      const { name, email, password, accepted } = regData;

      if (!name || !email || !password) {
        setError({ msg: "Proszę wypełnij wszystkie pola", type: "all" });
        setIsLoading(false);
        return;
      }
      if (!accepted) {
        setError({ msg: "Akceptacja regulaminu jest obowiązkowa", type: "acc" });
        setIsLoading(false);
        return;
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      if (!emailOk) {
        setError({ msg: "Podaj poprawny adres e-mail", type: "email" });
        setIsLoading(false);
        return;
      }

      const passOk = /^(?=.*[A-Za-z])(?=.*\d).{7,}$/.test(password);
      if (!passOk) {
        setError({ msg: "Hasło powinno zawierać minimum 7 znaków, literę oraz cyfrę", type: "pswd" });
        setIsLoading(false);
        return;
      }

      const res = await register({ email, password, accountType: "User", userName: name });
      if (res.aborted) return;

      if (res.status === 200) {
        showToast("Konto założone poprawnie", "success");
      }
      if (res.status === 409) {
        setError({ msg: "Konto z tym adresem e-mail już istnieje.", type: "email" });
        setIsLoading(false);
        return;
      }
      if (res.status === 500 || res.status === 400) {
        showToast("Upss... coś poszło nie tak", "error");
        setIsLoading(false);
        return;
      }
    }

    const fd = new FormData();
    fd.append("Name", questData.name ?? "");
    fd.append("Desc", questData.desc ?? "");
    fd.append("MaxPrice", questData.maxPrice ?? 0);
    fd.append("ExpectedRealisationTime", questData.expRelTime);
    fd.append("CategoryType", questData.category);
    (questData.tags ?? []).forEach((tag) => {
      if (tag) fd.append("Tags", tag);
    });
    (questData.files ?? []).forEach((f, idx) => {
      const bytes = f.bytes instanceof Uint8Array ? f.bytes : new Uint8Array(f.bytes || []);
      const blob = new Blob([bytes], { type: "image/*" });
      const filename = `image_${idx + 1}.jpg`;
      fd.append("Images", blob, filename);
    });
    if (questData.location) {
      const { name, long, lat } = questData.location;
      if (name) fd.append("Location.Name", name);
      if (typeof long === "number") fd.append("Location.Longtitude", String(long));
      if (typeof lat === "number") fd.append("Location.Latitude", String(lat));
    }

    var pubRes = await publishTask(fd);
    if (pubRes.aborted) return;

    if (pubRes.status === 200) {
      showToast("Ogłoszenie zamieszczone!", "success");
      setIsLoading(false);
      close();
      return;
    }

    showToast(null, "error");
    setIsLoading(false);
    return;
  };

  const close = () => {
    questData.files.forEach((f) => URL.revokeObjectURL(f.url));
    setIsLoading(false);
    setFileError(null);
    setError({ msg: null, type: null });
    setQuestData(EMPTY_QUEST);
    setRegData(EMPTY_REG);
    setProgress(0);
    onClose();
  };

  const renderStep = () => {
    const animationClass = slideDirection === "right" ? "animate-[slideInRight_0.3s_ease-out]" : "animate-[slideInLeft_0.3s_ease-out]";

    switch (progress) {
      case 0:
        return (
          <div className={`px-12 pb-8 ${animationClass}`}>
            <StepHeader title="Opisz swoje zlecenie" subtitle="Im więcej szczegółów podasz, tym lepsze oferty otrzymasz od wykonawców" />

            <div className="space-y-4 max-w-3xl mx-auto">
              <FloatingInput label="Nazwa" value={questData.name ?? ""} onChange={(e) => setQuestData((prev) => ({ ...prev, name: e.target.value }))} />

              <FloatingTextarea label="Opis" value={questData.desc ?? ""} onChange={(e) => setQuestData((prev) => ({ ...prev, desc: e.target.value }))} rows={5} />
            </div>

            <NavButtons progress={progress} canProceed={questData.name && questData.desc} onNext={goNext} onBack={goBack} />
          </div>
        );

      case 1:
        return (
          <div className={`px-12 pb-8 ${animationClass}`}>
            <StepHeader title="Dodaj zdjecia" subtitle="Zdjęcia pomagają wykonawcom lepiej oszacować zakres pracy i przygotować dokładniejszą wycenę" />

            <div className="max-w-3xl mx-auto">
              <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer flex flex-col items-center gap-4 group ${questData.files.length >= 5 ? "border-base-300 bg-base-200/50 cursor-not-allowed" : "border-primary/30 hover:border-accent hover:bg-accent/5"}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all ${questData.files.length >= 5 ? "bg-base-300 text-base-content/30" : "bg-base-200 group-hover:bg-accent/20 text-base-content/50 group-hover:text-accent"}`}>
                  +
                </div>
                <div className="text-center">
                  <p className="font-medium">Kliknij aby dodać zdjęcia</p>
                  <p className="text-sm text-base-content/50 mt-1">PNG, JPG do 10MB • Maksymalnie 5 zdjęć</p>
                </div>
                <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleFiles} className="hidden" disabled={questData.files.length >= 5} />
              </div>

              {questData.files.length > 0 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {questData.files.map((file) => (
                    <div key={file.id} className="relative aspect-square group">
                      <img src={file.url} alt="" className="w-full h-full object-cover rounded-xl border-2 border-accent/50" />
                      <button onClick={() => removeFile(file.id)} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-error text-error-content shadow-lg flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {fileError && (
                <div className="mt-4 p-3 rounded-xl bg-error/10 text-error text-sm">
                  {fileError}
                </div>
              )}
            </div>

            <NavButtons progress={progress} onNext={goNext} onBack={goBack} />
          </div>
        );

      case 2:
        return (
          <div className={`px-12 pb-8 ${animationClass}`}>
            <StepHeader title="Termin realizacji" subtitle="Jak szybko potrzebujesz wykonać to zlecenie?" />

            <div className="flex flex-col gap-3 max-w-xl mx-auto">
              {TIME_OPTIONS.map((opt) => (
                <OptionCard key={opt.value} selected={questData.expRelTime === opt.value} onClick={() => setQuestData((prev) => ({ ...prev, expRelTime: opt.value }))} label={opt.label} />
              ))}
            </div>

            <NavButtons progress={progress} canProceed={!!questData.expRelTime} onNext={goNext} onBack={goBack} />
          </div>
        );

      case 3:
        return (
          <div className={`px-12 pb-8 ${animationClass}`}>
            <StepHeader title="Lokalizacja" subtitle="Gdzie ma być wykonane zlecenie?" />

            <div className="max-w-4xl mx-auto">
              <div className="h-96 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-inner">
                <LocationPicker initial={{ lat: questData?.location?.lat, lng: questData?.location?.long }} onPick={(lat, lng, x) => setQuestData((prev) => ({ ...prev, location: { ...prev.location, lat, long: lng, name: `${x.postalCode} ${x.city} ${x.street}` } }))} />
              </div>
            </div>

            <NavButtons progress={progress} onNext={goNext} onBack={goBack} />
          </div>
        );

      case 4:
        return (
          <div className={`px-12 pb-8 ${animationClass}`}>
            <StepHeader title="Kategorie" subtitle="Wybierz kategorię i tagi, które najlepiej opisują twoje zlecenie" />

            <div className="max-w-5xl mx-auto">
              <div className="mb-6 text-center">
                <p className="text-sm font-medium text-base-content/60 mb-3">Kategorie</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.map((category) => (
                    <button key={category.category} onClick={() => { setQuestData((prev) => ({ ...prev, category: category.category, tags: [] })); }} className={`px-4 py-2 cursor-pointer rounded-full font-medium transition-all duration-200 border-2 ${questData.category === category.category ? "bg-accent text-accent-content border-accent shadow-lg shadow-accent/25" : "bg-base-100 border-primary/30 hover:border-primary text-base-content"}`}>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {questData.category && (
                <div className="animate-[fadeIn_0.3s_ease-out] text-center">
                  <p className="text-sm font-medium text-base-content/60 mb-3">Podkategorie</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {categories.find((a) => a.category === questData.category)?.tags?.map((tag) => (
                      <button key={tag.tagName} onClick={() => setQuestData((prev) => { const isSelected = prev.tags.includes(tag.tagName); return { ...prev, tags: isSelected ? prev.tags.filter((t) => t !== tag.tagName) : [...prev.tags, tag.tagName] }; })} className={`px-3 py-1.5 cursor-pointer rounded-full text-sm font-medium transition-all duration-200 border-2 ${questData.tags.includes(tag.tagName) ? "bg-primary text-primary-content border-primary shadow-md" : "bg-base-100 border-primary/30 hover:border-primary text-base-content"}`}>
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavButtons progress={progress} canProceed={!!questData.category} onNext={goNext} onBack={goBack} />
          </div>
        );

      case 5:
        return (
          <div className={`px-12 pb-8 ${animationClass}`}>
            <StepHeader title="Budzet" subtitle="Określenie budżetu pomoże przyciągnąć odpowiednich wykonawców" />

            <div className="max-w-xl mx-auto">
              <div className="flex flex-col gap-3 mb-6">
                {BUDGET_OPTIONS.map((opt) => (
                  <OptionCard key={opt.value ?? "null"} selected={opt.value === null ? questData.maxPrice === null || questData.maxPrice === 0 : opt.value === 999 ? questData.maxPrice > 0 && questData.maxPrice < 1000 : opt.value === 4999 ? questData.maxPrice >= 1000 && questData.maxPrice < 5000 : questData.maxPrice >= 5000 && questData.maxPrice < 10000} onClick={() => setQuestData((prev) => ({ ...prev, maxPrice: opt.value }))} label={opt.label} />
                ))}
              </div>

              <div className="relative">
                <input type="number" placeholder="Lub wpisz własną kwotę..." min="1" max="100000" onChange={(e) => setQuestData((prev) => ({ ...prev, maxPrice: parseInt(e.target.value) || null }))} className="w-full px-4 pr-4 py-4 rounded-xl border-2 border-primary/30 bg-base-100 outline-none transition-all duration-200 focus:border-accent focus:ring-4 focus:ring-accent/10 hover:border-primary" />
              </div>
            </div>

            <NavButtons progress={progress} nextLabel="Stwórz ogłoszenie" onNext={goNext} onBack={goBack} />
          </div>
        );

      case 6:
        if (!isAuthed) {
          return (
            <div className={`px-12 pb-8 ${animationClass}`}>
              <StepHeader title="Prawie gotowe!" subtitle="Załóż konto, żeby wykonawcy mogli się z tobą skontaktować" />

              <div className="max-w-xl mx-auto space-y-4">
                <FloatingInput label="Imię" value={regData.name} onChange={(e) => { setRegData((prev) => ({ ...prev, name: e.target.value })); clearError(); }} error={error?.type === "name" || error?.type === "all"} />

                <FloatingInput label="Email" type="email" value={regData.email} onChange={(e) => { setRegData((prev) => ({ ...prev, email: e.target.value })); clearError(); }} error={error?.type === "email" || error?.type === "all"} />

                <FloatingInput label="Hasło" type="password" value={regData.password} onChange={(e) => { setRegData((prev) => ({ ...prev, password: e.target.value })); clearError(); }} error={error?.type === "pswd" || error?.type === "all"} />

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={regData.accepted} onChange={(e) => { setRegData((prev) => ({ ...prev, accepted: e.target.checked })); clearError(); }} className={`checkbox checkbox-primary ${error.type === "acc" ? "checkbox-error" : ""}`} />
                  <span className={`text-sm ${error.type === "acc" ? "text-error" : "text-base-content/70"}`}>
                    Akceptuję <a href="#" className="text-primary hover:underline font-medium">regulamin</a> i{" "}
                    <a href="#" className="text-primary hover:underline font-medium">politykę prywatności</a> serwisu
                  </span>
                </label>

                {error.msg && (
                  <div className="p-4 rounded-xl bg-error/10 text-error text-sm">
                    {error.msg}
                  </div>
                )}

                <button onClick={() => publish(true)} className="w-full btn btn-accent btn-lg mt-6 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Załóż konto i opublikuj
                </button>
              </div>
            </div>
          );
        } else {
          publish();
        }
        break;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => close()} role="dialog">
        <div ref={panelRef} className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-base-100 rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 mt-3 z-10 bg-base-100/95 backdrop-blur-sm border-b border-base-200">
            <Stepper progress={progress} />
          </div>

          {isLoading ? (
            <div className="px-6 py-16 flex flex-col items-center justify-center gap-4">
              <ActivityIndicator size="medium" />
            </div>
          ) : (
            <div className="pt-6">{renderStep()}</div>
          )}
        </div>
      </div>
    </>
  );
}