import { useEffect, useState, useRef } from "react"
import { ProfileService } from "@/api/services/ProfileService";
import { useMutation } from "@/api/hooks/useMutation";
import { useToast } from "@/context/ToastContext";

import ActivityIndicator from "@/components/ActivityIndicator";
import PfpDisplay from "@/components/dashboard/PfpDisplay";
import ProfileInfoPanelEdit from "./ProfileInfoPanelEdit";
import ImageDisplay from "@/components/ImageDisplay";
import MapPin from "@/components/MapPin";

const baseUrl = import.meta.env.VITE_API_ORIGIN;

export default function ProfileInfoPanel({own = false, id = null}){
    const { showToast } = useToast();
    const initialLoad = useRef(false);

    const [isLoading, setIsLoading] = useState(true);
    const [companyData, setCompanyData] = useState(null);
    const [pfp, setPfp] = useState(null);
    const [selectedSub, setSelectedSub] = useState("info");
    
    const [isEditing, setIsEditing] = useState(false);

    const { mutate: getOwn } = useMutation(
        (_vars, ctx) => ProfileService.getOwn(ctx)
    );
    const { mutate: getCompanyProfile } = useMutation(
        (vars, ctx) => ProfileService.getCompanyProfile(vars, ctx)
    );

    const fetchCompData = async () => {
        if(!own && !id){ showToast("nie mogliśmy załadować profilu", "error"); return; }

        const res = (!id) ? await getOwn() : await getCompanyProfile(id);
        setIsLoading(false);
        if(res.status !== 200 || res.aborted){ showToast(null, "error"); return; }

        let data = (!id) ? res.data.companyProfileDataVMO : res.data;
        let pfp = `${baseUrl}${data.img}`
        setCompanyData(data);
        setPfp(pfp);
    };

    useEffect(() => {
        if (!initialLoad.current) {
            initialLoad.current = true;
            fetchCompData();
        }
    }, []);

    const generatePanelContent = () => {
        switch(selectedSub){
            case "info":
                return (
                    <div className="w-full min-h-36 mt-3 flex flex-col items-center justify-center">
                        {companyData.desc && companyData.realizations ? (
                            <>
                                {companyData.desc && (
                                    <>
                                        <p className="font-marker text-lg tracking-widest mb-3">O nas</p>
                                        <p className="text-center tracking-wide">{companyData.desc}</p>
                                    </>
                                )}
                                {companyData.realizations && companyData.realizations.length > 0 && (
                                    <>
                                        <p className="font-marker text-lg tracking-widest mb-3 mt-6">Nasze projekty</p>
                                        <div className="w-full flex flex-row gap-3">
                                            {companyData.realizations.map((rel) => (
                                                <ImageDisplay size="medium" source={`${baseUrl}${rel.img}`} prevThumb={{ title: rel.title, msg: rel.desc, addons: `${rel.localization} ${rel.date}` }} />                                  
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ):(
                            <>
                                <p className="font-marker tracking-widest text-[92px] rotate-90"> :(</p> 
                                <p className="font-marker tracking-widest text-lg">Firma <span className="text-accent">{companyData.companyName}</span> nie podała o sobie informacji.</p>
                            </>
                        )}
                    </div>
                );
            case "contact":
                return (
                    <div className="w-full min-h-36 mt-3 flex flex-col items-center justify-center">
                        {(companyData.email?.trim() || companyData.phoneNumber?.trim()) ? (
                            <div className="w-full flex flex-row items-center justify-center gap-32">
                                {companyData.email && (
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                        </svg>
                                        <p className="tracking-widest">{companyData.email}</p>
                                    </div>
                                )}
                                {companyData.phoneNumber && (
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                        </svg>
                                        <p className="tracking-widest">{companyData.phoneNumber}</p>
                                    </div>
                                )}
                            </div>
                        ):(
                            <>
                                <p className="font-marker tracking-widest text-[92px] rotate-90"> :(</p> 
                                <p className="font-marker tracking-widest text-lg">Firma <span className="text-accent">{companyData.companyName}</span> nie podała zadnych danych kontaktowych.</p>
                            </>
                        )}
                    </div>
                );
            case "address":
                return (
                    <div className="w-full min-h-36 mt-3 flex flex-col items-center justify-center">
                        {companyData.adress ? (
                            <>
                                <MapPin lat={ companyData.adress?.lattitude ?? 52.2297} lng={ companyData.adress?.longtitude ?? 21.0122 } zoom={14}/>
                            </>
                        ):(
                            <>
                                <p className="font-marker tracking-widest text-[92px] rotate-90"> :c</p> 
                                <p className="font-marker tracking-widest text-lg">Firma <span className="text-accent">{companyData.companyName}</span> nie podała swojego adresu.</p>
                            </>
                        )}
                    </div>
                );
            case "opinions":
                return (
                    <div className="w-full min-h-36 mt-3 flex flex-col items-center justify-center">
                        {companyData.opinions && companyData.opinions.length > 0 ? (
                            <>

                            </>
                        ):(
                            <>
                                <p className="font-marker tracking-widest text-[92px] rotate-90"> :i</p> 
                                <p className="font-marker tracking-widest text-lg">Firma <span className="text-accent">{companyData.companyName}</span> nie ma jeszcze opini!</p>
                            </>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-auto min-h-128 flex flex-col bg-base-100 rounded-2xl shadow-2xl p-13 relative">
            {isLoading ? (
                <div className="w-full min-h-128 flex items-center justify-center"><ActivityIndicator size="medium"/></div>
            ):(
                <>
                    {(isEditing && own) ? (
                        <>
                            <ProfileInfoPanelEdit data={companyData} onEdit={() => setIsEditing(!isEditing)} />
                        </>
                    ):(
                        <>
                            {!companyData || companyData.length === 0 ? (
                                <div className="w-full min-h-128 flex flex-col items-center justify-center py-12">
                                    <p className="font-marker text-[196px] tracking-wide rotate-90">:C</p>
                                    <p className="font-marker text-2xl tracking-widest">cos poszlo nie tak...</p>
                                </div>
                            ):(
                                <>
                                    <div className="w-full flex flex-col relative">
                                        <img className="h-82" src={`${import.meta.env.VITE_API_ORIGIN}${companyData.backgroundImg}`} />
                                        <div className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-[50%] cursor-pointer flex flex-col items-center">
                                            <PfpDisplay overlay="true" size="xl" type="Company" source={pfp} />
                                            <p className="mt-3 font-marker text-2xl tracking-widest text-primary text-center w-full whitespace-nowrap">{companyData.companyName}</p>
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-row items-center justify-between mt-40">
                                        <div className="flex w-1/3 flex-col items-center justify-center">
                                            <p className="font-marker tracking-wide text-3xl">{companyData.realizedTasks}</p>
                                            <p className="font-marker tracking-wide">zrealizowanych zlecen</p>
                                        </div>
                                        <div className="flex w-1/3 flex-col items-center justify-center">
                                            <p className="font-marker tracking-wide text-3xl">{companyData.opinionCount}</p>
                                            <p className="font-marker tracking-wide">opini</p>
                                        </div>
                                        <div className="flex w-1/3 flex-col items-center justify-center">
                                            <p className="font-marker tracking-wide text-3xl">{companyData.rate} / 5</p>
                                            <p className="font-marker tracking-wide">ocena uzytkownikow</p>
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-row gap-6 mt-16">
                                        <p onClick={() => setSelectedSub("info")} className={`font-marker text-lg cursor-pointer hover:text-accent ${selectedSub === "info" ? "text-accent" : ""}`}>Informacje</p>
                                        <p onClick={() => setSelectedSub("contact")} className={`font-marker text-lg cursor-pointer hover:text-accent ${selectedSub === "contact" ? "text-accent" : ""}`}>Kontakt</p>
                                        <p onClick={() => setSelectedSub("address")} className={`font-marker text-lg cursor-pointer hover:text-accent ${selectedSub === "address" ? "text-accent" : ""}`}>Adres</p>
                                        <p onClick={() => setSelectedSub("opinions")} className={`font-marker text-lg cursor-pointer hover:text-accent ${selectedSub === "opinions" ? "text-accent" : ""}`}>Opinie</p>
                                    </div>
                                    { generatePanelContent() }
                                </>
                            )}
                        </>
                    )}
                </>
            )}

            {own && (
                <div onClick={() => setIsEditing(!isEditing)} className="absolute top-5 right-5 cursor-pointer">
                    {isEditing ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    ):(
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    )}
                </div>
            )}
        </div>
    )
}