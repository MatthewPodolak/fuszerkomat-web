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
  const [error, setError] = useState({
    msg: null,
    type: null, //all name email pswd acc
  });

  const allTags = categories.flatMap((cat) => cat.tags.map((tag) => ({ ...tag })));
  const clearError = useCallback(() => setError({ msg: null, type: null }), []);
  const { mutate: register } = useMutation(
    (vars, ctx) => AuthService.register(vars.email, vars.password, vars.accountType, vars.userName, vars.companyName, ctx)
  );
  const { mutate: publishTask } = useMutation(
    (vars, ctx) => UserTaskService.publishTask(vars, ctx)
  );

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

  const handleFiles = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (!fileList.length) return;

    if(fileList.length + questData.files.length > 5){ setFileError("Możesz dodać maksymalnie 5 obrazków."); return; }

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

    e.target.value = "";
  };

  const removeFile = (id) => {
    setQuestData((prev) => {
        const toRemove = prev.files.find((f) => f.id === id);
        if (toRemove) URL.revokeObjectURL(toRemove.url);
        return { ...prev, files: prev.files.filter((f) => f.id !== id) };
    });
  };

  const stepGen = () => {
    switch(progress){
        case 0:
            return (
                <div className="px-3 xl:px-6 flex flex-col items-center justify-center gap-6">
                    <p className="text-lg tracking-wide font-semibold text-center">Opisz dokładniej czego potrzebujesz, wykonawcą będzie łatwiej : )</p>
                    <div className="w-full relative mt-2">
                        <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Nazwa</p>
                        <input onChange={(e) => {setQuestData(prev => ({ ...prev, name: e.target.value })); }} value={questData.name ?? ""} type="text" className="input input-bordered w-full" />
                    </div>
                    <div className="w-full relative">
                        <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Opis</p>
                        <textarea onChange={(e) => {setQuestData(prev => ({ ...prev, desc: e.target.value })); }} value={questData.desc ?? ""} type="text" className="textarea textarea-bordered w-full min-h-36 resize-none" />
                    </div>
                    <div className="w-full flex justify-end mb-6">
                        <button onClick={() => setProgress(progress+1)} className="btn btn-accent w-full xl:w-36">Dalej</button>
                    </div>
                </div>
            );
        case 1:
            return (
                <div className="px-3 xl:px-6 flex flex-col items-center justify-center gap-6">
                    <p className="text-lg tracking-wide font-semibold text-center">Masz jakieś zdjęcia?</p>
                    <p className="text-md -mt-3 text-center">Wykonawcy je uwielbiają - łatwiej im oszacować fuszkę. Jak je dodasz - będziesz mieć o wiele więcej zgłoszeń.</p>
                    <div className="w-full flex flex-row gap-3">
                        <div onClick={() => fileInputRef.current?.click()} className="border border-gray-400 rounded-xl w-30 h-30 flex items-center justify-center cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.6} stroke="currentColor" className="size-12">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                            <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleFiles} className="hidden" />
                        </div>
                        {questData.files.length > 0 && (
                            <>
                                {questData.files.map((file) => (
                                    <div key={file.id} className="w-30 h-30 border border-gray-400 rounded-xl relative">
                                        <img src={file.url} className="w-full h-full rounded-xl object-cover" />
                                        <svg onClick={() => removeFile(file.id)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black" className="size-6 cursor-pointer absolute top-1 right-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    {fileError && (
                        <p className="text-red-500">{fileError}</p>
                    )}
                    <div className="w-full flex flex-col lg:flex-row justify-end mb-6 gap-3">
                        <button onClick={() => setProgress(progress-1)} className="btn btn-soft w-full xl:w-36">Cofnij</button>
                        <button onClick={() => setProgress(progress+1)} className="btn btn-accent w-full xl:w-36">Dalej</button>
                    </div>
                </div>
            );
        case 2:
            return (
                <div className="px-3 xl:px-6 flex flex-col items-center justify-center gap-6">
                    <p className="text-lg tracking-wide font-semibold text-center">Pogadajmy o terminie wykonania...</p>
                    <p className="text-md -mt-3">Jak szybko trzeba się z tym uwinąć?</p>
                    <div className="w-full flex flex-col gap-3">
                        <div onClick={() => setQuestData((prev) => ({ ...prev, expRelTime: "Asap" }))} className={`btn w-full ${questData.expRelTime === "Asap" ? "btn-accent" : "btn-outline btn-accent"}`}>Tak szybko jak to tylko możliwe</div>
                        <div onClick={() => setQuestData((prev) => ({ ...prev, expRelTime: "ThisWeek" }))} className={`btn w-full ${questData.expRelTime === "ThisWeek" ? "btn-accent" : "btn-outline btn-accent"}`}>W ciągu tygodnia</div>
                        <div onClick={() => setQuestData((prev) => ({ ...prev, expRelTime: "TwoWeeks" }))} className={`btn w-full ${questData.expRelTime === "TwoWeeks" ? "btn-accent" : "btn-outline btn-accent"}`}>W ciągu dwóch tygodni</div>
                        <div onClick={() => setQuestData((prev) => ({ ...prev, expRelTime: "Adaptive" }))} className={`btn w-full ${questData.expRelTime === "Adaptive" ? "btn-accent" : "btn-outline btn-accent"}`}>Niech będzie. Dostusuję się.</div>
                    </div>
                    <div className="w-full flex flex-col lg:flex-row justify-end mb-6 gap-3">
                        <button onClick={() => setProgress(progress-1)} className="btn btn-soft w-full xl:w-36">Cofnij</button>
                        {questData.expRelTime ? (
                            <button onClick={() => setProgress(progress+1)} className="btn btn-accent w-full xl:w-36">Dalej</button>
                        ):(
                            <button className="btn btn-soft w-full xl:w-36">Dalej</button>
                        )}
                    </div>
                </div>
            );
        case 3:
            return (
                <div className="px-3 xl:px-6 flex flex-col items-center justify-center gap-6">
                    <p className="text-lg tracking-wide font-semibold text-center">Gdzie jest to bojowe zadanie?</p>
                    <div className="w-full flex gap-3 h-96 border rounded-xl border-gray-400 items-stretch">
                        <LocationPicker
                            initial={{ lat: questData?.location?.lat, lng: questData?.location?.long }}
                            onPick={(lat, lng, x) => setQuestData(prev => ({ ...prev, location: { ...prev.location, lat, long: lng } }))}
                        />
                    </div>
                    <div className="w-full flex flex-col xl:flex-row justify-end mb-6 gap-3">
                        <button onClick={() => setProgress(progress-1)} className="btn btn-soft w-full xl:w-36">Cofnij</button>
                        <button onClick={() => setProgress(progress+1)} className="btn btn-accent w-full xl:w-36">Dalej</button>
                    </div>
                </div>
            );
        case 4:
            return (
                <div className="px-3 xl:px-6 flex flex-col items-center justify-center gap-6">
                    <p className="text-lg tracking-wide font-semibold text-center">Co najlepiej opisuje twoje ogloszenie?</p>
                    <div className="w-full flex flex-wrap items-center justify-center gap-3">
                        {categories.map((category) => (
                        <div key={category.category} onClick={() => {setQuestData((prev) => ({ ...prev, category: category.category })); setQuestData((prev) => ({ ...prev, tags: [] }));} } className={`btn ${questData.category === category.category ? "btn-accent" : "btn-outline btn-accent"} rounded-full px-3 py-1 h-auto w-auto cursor-pointer"`} >
                            <p className="text-sm whitespace-nowrap">{category.name}</p>
                        </div>
                        ))}
                    </div>
                    <div className="w-full flex flex-wrap items-center justify-center gap-3">
                        {categories.find((a) => a.category === questData.category)?.tags?.map((tag) => (
                            <div key={tag.name} onClick={() => setQuestData((prev) => {
                                const isSelected = prev.tags.includes(tag.tagName);
                                return { ...prev, tags: isSelected ? prev.tags.filter((t) => t !== tag.tagName) : [...prev.tags, tag.tagName], };})
                            } className={`btn ${questData.tags.includes(tag.tagName) ? "btn-primary" : "btn-outline btn-primary"} rounded-full px-3 py-1 h-auto w-auto cursor-pointer"`} >
                                <p>{tag.name}</p>
                            </div>
                        ))}
                    </div>
                    <div className="w-full flex flex-col xl:flex-row justify-end mb-6 gap-3">
                        <button onClick={() => setProgress(progress-1)} className="btn btn-soft w-full xl:w-36">Cofnij</button>
                        {questData.category ? (
                            <button onClick={() => setProgress(progress+1)} className="btn btn-accent w-full xl:w-36">Dalej</button>
                        ):(
                            <button className="btn btn-soft w-full xl:w-36">Dalej</button>
                        )}
                    </div>
                </div>
            );
        case 5:
            return (
                <div className="px-3 xl:px-6 flex flex-col items-center justify-center gap-6">
                    <p className="text-lg tracking-wide font-semibold text-center">Masz jakiś ustalony budżet?</p>
                    <p className="text-md -mt-3">Czasem lepiej go nie podawać...</p>
                    <div className="w-full flex flex-col gap-3">
                        <div onClick={() => setQuestData((prev) => ({ ...prev, maxPrice: null }))} className={`btn w-full ${(questData.maxPrice === null || questData?.maxPrice === 0) ? "btn-accent" : "btn-outline btn-accent"}`}>Nie chcę podawać</div>
                        <div onClick={() => setQuestData((prev) => ({ ...prev, maxPrice: 999 }))} className={`btn w-full ${(questData.maxPrice < 1000 && questData.maxPrice > 0) ? "btn-accent" : "btn-outline btn-accent"}`}>Do tysiąca</div>
                        <div onClick={() => setQuestData((prev) => ({ ...prev, maxPrice: 4999 }))} className={`btn w-full ${(questData.maxPrice < 5000 && questData.maxPrice > 1000) ? "btn-accent" : "btn-outline btn-accent"}`}>1000 - 5000</div>
                        <div onClick={() => setQuestData((prev) => ({ ...prev, maxPrice: 9999 }))} className={`btn w-full ${(questData.maxPrice < 10000 && questData.maxPrice > 5000) ? "btn-accent" : "btn-outline btn-accent"}`}>5000 - 10000</div>
                        <div className="w-full relative">
                            <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Własny</p>
                            <input onChange={(e) => {setQuestData(prev => ({ ...prev, maxPrice: e.target.value })); }} type="number" className="input validator w-full" min="1" max="100000" />
                        </div>
                    </div>
                    <div className="w-full flex flex-col xl:flex-row justify-end mb-6 gap-3">
                        <button onClick={() => setProgress(progress-1)} className="btn btn-soft w-full xl:w-36">Cofnij</button>
                        <button onClick={() => setProgress(progress+1)} className="btn btn-accent w-full xl:w-52">Stworz ogloszenie</button>
                    </div>
                </div>
            );
        case 6:
            if(!isAuthed){
                return (
                    <div className="px-3 xl:px-6 flex flex-col items-center justify-center gap-6">
                        <p className="text-lg tracking-wide font-semibold text-center">Wszystko super, teraz jeszcze tylko...</p>
                        <p className="text-md -mt-3 text-center">Zostało założyć konto. W jakiś sposób wykonawcy muszą się z tobą skontaktować.</p>
                        <div className="w-full relative mt-2">
                            <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Imie</p>
                            <input onChange={(e) => {setRegData(prev => ({ ...prev, name: e.target.value })); clearError();}} type="text" className="input input-bordered w-full" />
                        </div>
                        <div className="w-full relative mt-2">
                            <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Email</p>
                            <input onChange={(e) => {setRegData(prev => ({ ...prev, email: e.target.value })); clearError();}} type="email" className={`input input-bordered w-full ${error?.type === 'email' || error?.type === 'all' ? 'border-red-500' : ''}`} />
                        </div>
                        <div className="w-full relative">
                            <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-gray-500 z-10">Hasło</p>
                            <input onChange={(e) => {setRegData(prev => ({ ...prev, password: e.target.value })); clearError();}} type="password" className={`input input-bordered w-full ${error?.type === 'pswd' || error?.type === 'all' ? 'border-red-500' : ''}`} />
                        </div>
                        <div className="w-full">
                            <label className={`flex items-center gap-2 text-sm mt-1 ${error.type === "acc" ? "text-red-500" : "text-gray-600"}`}>
                                <input type="checkbox" className={`checkbox ${error.type === "acc" ? "checkbox-error" : "checkbox-primary"}`} onChange={(e) => { setRegData(prev => ({ ...prev, accepted: e.target.checked })); clearError(); }} />
                                <span>Akceptuję <a href="#" className={`${error.type === "acc" ? "text-red-500 hover:text-red-600" : "text-primary hover:text-primary-focus"} underline`}>regulamin</a> serwisu *</span>
                            </label>
                        </div>
                        {error.msg && (
                            <p className="text-red-500 tracking-wider text-center">{error.msg}</p>
                        )}
                        <div className="w-full flex justify-center mb-6">
                            <button onClick={() => publish(true)} className="btn btn-success w-full">Załóż konto i opublikuj</button>
                        </div>
                    </div>
                )
            }else{
                publish();
            }
            break;
    }
  };

  const publish = async (withRegister = false) => {
    setIsLoading(true);
    if(withRegister){
        const { name, email, password, accepted } = regData;

        if(!name || !email || !password){ setError({msg: "Proszę wypełnij wszystkie pola"}); setIsLoading(false); return; }
        if(!accepted){ setError({msg: "Akceptacja regulaminu jest obowiązkowa", type: "acc"}); setIsLoading(false); return }

        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
        if (!emailOk) { setError({ msg: "Podaj poprawny adres e-mail", type: "email" }); setIsLoading(false); return; }

        const passOk = /^(?=.*[A-Za-z])(?=.*\d).{7,}$/.test(password);
        if (!passOk) { setError({ msg: "Hasło powinno zawierać minimum 7 liter znak oraz cyfrę", type: "pswd" }); setIsLoading(false); return; }
    
        const res = await register({ email, password, accountType: "User", userName: name })
        if (res.aborted) return;

        if(res.status === 200){ showToast("Konto założone poprawnie", "success"); }
        if(res.status === 409){ setError({msg: "Konto z tym adresem e-mail już istnieje.", type: "email"}); setIsLoading(false); return; }
        if(res.status === 500 || res.status === 400){ showToast("Upss... coś poszło nie tak", "error"); setIsLoading(false); return; }
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

    if(pubRes.status === 200){ showToast("Ogloszenie zamieszczone!","success"); onClose(); return; }

    showToast(null,"error"); return;
  };

  const close = () => {
    questData.files.forEach((f) => URL.revokeObjectURL(f.url));
    setIsLoading(false);
    setFileError(null);
    setError({ msg: null, type: null });
    setQuestData(EMPTY_QUEST);
    setRegData(EMPTY_REG);
    setProgress(0);
    onClose()
  };

  return (
    <div className="fixed px-3 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => close()} role="dialog">
      <div ref={panelRef} className="w-full max-w-5xl min-h-80 bg-base-100 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="w-full flex flex-row items-center justify-center px-6 py-3 gap-3">
            <progress className="progress progress-primary w-full" value={progress} max="5"></progress>
            <svg onClick={() => close()} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 cursor-pointer">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </div>
        {isLoading ? (
            <div className="px-6 min-h-54 flex flex-col items-center justify-center gap-6">
                <ActivityIndicator size="medium" />
            </div>
        ):(
            <>{ stepGen() }</>
        )}
      </div>
    </div>
  );
}