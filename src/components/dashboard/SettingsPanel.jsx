import { useMutation } from "@/api/hooks/useMutation";
import { ProfileService } from "@/api/services/ProfileService";
import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function SettingsPanel(){
    const navigate = useNavigate();
    const { showToast } = useToast();

    const { mutate: deleteAcc } = useMutation(
        (ctx) => ProfileService.deleteAccount(ctx)
    );

    const deleteAccount = async () => {
        const res = await deleteAcc();

        if(res.status !== 200 || res.aborted){ showToast(null, "error"); return; }

        showToast("Pomyślnie usunięto konto", "success");
        navigate(`/`);
    };

    return (
        <div className="w-full h-auto flex flex-col lg:flex-row gap-3">
            <div className="w-91 h-24 bg-primary rounded-3xl shadow-md cursor-pointer hover:shadow-2xl flex justify-end items-end py-3 px-4">
                <p className="font-marker tracking-widest text-accent text-lg">zmien haslo</p>
            </div>
            <div onClick={() => deleteAccount()} className="w-91 h-24 bg-primary rounded-3xl shadow-md cursor-pointer hover:shadow-2xl flex justify-end items-end py-3 px-4">
                <p className="font-marker tracking-widest text-red-500 text-lg">usun konto</p>
            </div>
        </div>
    )
}