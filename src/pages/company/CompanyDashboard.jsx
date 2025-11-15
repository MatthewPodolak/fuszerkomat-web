import { useState, useMemo, lazy, Suspense } from "react";
import { useToast  } from "@/context/ToastContext";
import { AuthService } from "@/api/services/AuthService";
import ActivityIndicator from "@/components/ActivityIndicator.jsx";

const InfoPanel = lazy(() => import("@/components/dashboard/company/ProfileInfoPanel"));
const AppliedPanel = lazy(() => import("@/components/dashboard/company/AppliedPanel"));
const SettingsPanel = lazy(() => import("@/components/dashboard/company/SettingsPanel"));

const TABS = [
  { key: "info", label: "Profil" },
  { key: "applied", label: "Aplikacje" },
  { key: "settings", label: "Ustawienia konta" },
];

export default function UserDashboard() {
  const { showToast } = useToast();

  const [selected, setSelected] = useState("info");

  const content = useMemo(() => {
    switch (selected) {
      case "info":
        return <InfoPanel own={true} />;
      case "applied":
        return <AppliedPanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return null;
    }
  }, [selected]);

  const logoutReq = async () => {
    const res = await AuthService.logout();
    if(res.status === 200){ showToast("Poprawnie wylogowano", "success"); return; }

    showToast(null, "error");
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
                                "btn w-full justify-center lg:justify-start rounded-xl transition-all duration-200 tracking-wide",
                                active
                                ? "btn-accent text-accent-content ring-2 ring-accent/50"
                                : "btn-primary text-accent hover:text-white",
                            ].join(" ")}> {t.label}
                        </button>
                    </li>
                  );
                })}
                <li className="flex-1 mt-3 lg:mt-12 col-span-2 lg:col-span-1">
                    <button onClick={() => logoutReq()} className="btn col-span-2 lg:col-span-1 text-center w-full btn-error justify-center rounded-xl font-marker tracking-widest">Wyloguj sie</button>
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