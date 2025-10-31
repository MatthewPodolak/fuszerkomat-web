import { useEffect, useState, useRef } from "react";
import { ProfileService } from "@/api/services/ProfileService";
import { useMutation } from "@/api/hooks/useMutation";
import { useToast } from "@/context/ToastContext";

import PfpDisplay from "../PfpDisplay";
import ActivityIndicator from "@/components/ActivityIndicator";

export default function ProfileInfoPanel(){
    const { showToast } = useToast();
    
    const [isEditing, setIsEditing] = useState(false);
    const [edited, setEdited] = useState(false);
    const [userProfileData, setUserProfileData] = useState({
        name: null,
        surname: null,
        email: null,
        phone: null,
        img: null,
    });
    const [formData, setFormData] = useState(null);
    const fileInputRef = useRef(null);

    const didRunRef = useRef(false);
    const [isLoading, setIsLoading] = useState(false);
    const { mutate: getOwn } = useMutation(
        (_vars, ctx) => ProfileService.getOwn(ctx)
    );
    const {mutate: patchProfileInfo } = useMutation(
        (vars, ctx) => ProfileService.patchProfileInfo(vars, ctx)
    );

    const updateReq = async () => {
        if(!(JSON.stringify(formData) !== JSON.stringify(userProfileData))){ return; }

        const fd = new FormData();
        fd.append("UserProfileInfo.Name", formData.name ?? "");
        fd.append("UserProfileInfo.Surname", formData.surname ?? "");
        fd.append("UserProfileInfo.Email", formData.email ?? "");
        fd.append("UserProfileInfo.PhoneNumber", formData.phone ?? "");

        if (formData.imgFile) {
            fd.append("UserProfileInfo.Photo", formData.imgFile, formData.imgFile.name);
        }

        const res = await patchProfileInfo(fd);
        setIsEditing(false);
        if(res.status === 200){
            if (formData?.img?.startsWith("blob:")) URL.revokeObjectURL(formData.img);
            if (fileInputRef.current) fileInputRef.current.value = "";
            didRunRef.current = false;
            setEdited(!edited);
            showToast("informacje zapisane", "success");
            return;
        }

        showToast("Upss... coś poszło nie tak.");
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);

        setFormData((prev) => ({
            ...prev,
            img: previewUrl,
            imgFile: file,
        }));
    };

    const getProfileDataReq = async () => {
        setIsLoading(true);
        const res = await getOwn();

        if(res.status === 200){
            const val = res.data.userProfileDataVMO;
            const baseUrl = import.meta.env.VITE_API_ORIGIN;

            const data = {
                name: val?.name ?? "",
                surname: val?.surname ?? "",
                email: val?.email ?? "",
                phone: val?.phoneNumber ?? "",
                img: val?.img ? `${baseUrl}${val.img}` : null,
            };
            setUserProfileData(data);
            setFormData(data);
            setIsLoading(false);
            return;
        }

        showToast("Upss... Coś poszło nie tak", "error");
    };

    useEffect(() => {
        if (didRunRef.current) return;

        didRunRef.current = true;
        getProfileDataReq();
    }, [edited]);

    return (
        <div className="w-full h-auto p-12 bg-base-100 rounded-2xl shadow-2xl flex flex-row gap-12 relative">
            {isEditing ? (
                <>
                    <div className="w-full h-auto flex flex-col items-center relative">
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        <div onClick={handleAvatarClick} className="cursor-pointer">
                            <PfpDisplay overlay="true" size="xl" type="User" source={formData.img} />
                        </div>
                        <div className="w-102 mt-12 flex flex-col gap-6">
                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Imie</p>
                                <input type="text" className={`input input-bordered border-black w-full`}
                                    value={formData?.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Nazwiko</p>
                                <input type="text" className={`input input-bordered border-black w-full`} 
                                    value={formData?.surname || ""} onChange={(e) => setFormData({ ...formData, surname: e.target.value })} />
                            </div>
                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Mail kontaktowy</p>
                                <input type="text" className={`input input-bordered border-black w-full`} 
                                    value={formData?.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Numer telefonu</p>
                                <input type="text" className={`input input-bordered border-black w-full`} 
                                    value={formData?.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <button onClick={() => updateReq()} className="btn btn-success font-marker tracking-widest" >zapisz zmiany</button>
                        </div>

                        <div onClick={() => setIsEditing(false)} className="absolute right-0 top-0 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                </>
            ):(
                <>
                    {!isLoading ? (
                        <>
                            <PfpDisplay size="xl" type="User" source={userProfileData.img} />
                            <div className="flex flex-col gap-6">
                                <div>
                                    <p className="font-marker text-accent">Imie i nazwisko</p>
                                    <p className="font-marker tracking-[0.4rem] text-2xl">{userProfileData.name} {userProfileData.surname}</p>
                                </div>
                                <div>
                                    <p className="font-marker text-accent">Adres e-mail do kontaktu</p>
                                    <p className="font-marker tracking-[0.4rem] text-2xl">{userProfileData.email}</p>
                                </div>
                                <div>
                                    <p className="font-marker text-accent">Telefon kontaktowy</p>
                                    <p className="font-marker tracking-[0.4rem] text-2xl">{userProfileData.phone}</p>
                                </div>
                            </div>

                            <div onClick={() => setIsEditing(true)} className="absolute right-10 top-10 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </div>
                        </>
                    ):(
                        <>
                            <div className="w-full h-full flex-1 items-center justify-center">
                                <ActivityIndicator size="medium" />
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}