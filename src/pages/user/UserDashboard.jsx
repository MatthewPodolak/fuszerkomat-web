import { useState, useMemo, lazy, Suspense } from "react";
import { useToast  } from "@/context/ToastContext";
import { AuthService } from "@/api/services/AuthService";
import ActivityIndicator from "@/components/ActivityIndicator.jsx";

const TaskPanel = lazy(() => import("@/components/dashboard/user/TaskPanel"));
const InfoPanel = lazy(() => import("@/components/dashboard/user/ProfileInfoPanel"));
const SettingsPanel = lazy(() => import("@/components/dashboard/SettingsPanel"));
const OpinionPanel = lazy(() => import("@/components/dashboard/user/OpinionPanel"));

const TABS = [
  { key: "info", label: "Profil" },
  { key: "tasks", label: "Zlecenia" },
  { key: "opinions", label: "Opinie" },
  { key: "settings", label: "Ustawienia konta" },
];

export default function UserDashboard() {
  const { showToast } = useToast();

  const [selected, setSelected] = useState("info");

  const content = useMemo(() => {
    switch (selected) {
      case "info":
        return <InfoPanel />;
      case "opinions":
        return <OpinionPanel />;
      case "settings":
        return <SettingsPanel />;
      case "tasks":
        return <TaskPanel />;
      default:
        return null;
    }
  }, [selected]);

  const logoutReq = async () => {
    const res = await AuthService.logout();
    if(res.status === 200){ showToast("Poprawnie wylogowano", "success"); return; }

    showToast("Upss... cos poszlo nie tak", "error");
  };

  return (
    <div className="min-h-screen w-full bg-base-200 py-8 px-4 flex justify-center">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6">

        <div className="w-full lg:w-64">
          <div className="bg-primary shadow-xl rounded-2xl">
            <div className="p-4">
              <ul className="grid grid-cols-2 lg:flex lg:flex-col gap-2">
                {TABS.map((t) => {
                  const active = selected === t.key;
                  return (
                    <li key={t.key} className="flex-1">
                        <button onClick={() => setSelected(t.key)}
                            className={[
                                "btn w-full rounded-xl transition-all duration-200 tracking-wide flex items-center justify-center lg:justify-start",
                                active
                                ? "btn-accent text-accent-content ring-2 ring-accent/50"
                                : "btn-primary text-accent hover:text-white",
                            ].join(" ")}> {t.label}
                        </button>
                    </li>
                  );
                })}
                <li className="flex-1 mt-3 lg:mt-12">
                    <button onClick={() => logoutReq()} className="btn text-center w-2/1 lg:w-full btn-error justify-center rounded-xl font-marker tracking-widest">Wyloguj sie</button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Suspense fallback={<div className="text-center p-8"> <ActivityIndicator size="medium" /> </div>}>
            {content}
          </Suspense>
        </div>

      </div>
    </div>
  );
}