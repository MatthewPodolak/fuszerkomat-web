import { useState, useRef } from "react";
import { useMutation } from "@/api/hooks/useMutation";
import { useToast } from "@/context/ToastContext";
import { ProfileService } from "@/api/services/ProfileService";

import PfpDisplay from "@/components/dashboard/PfpDisplay";
import LocationPicker from "@/components/LocationPicker";
import ImageDisplay from "@/components/ImageDisplay";
const baseUrl = import.meta.env.VITE_API_ORIGIN;

export default function ProfileInfoPanelEdit({data, onEdit}) {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: data.companyName ?? null,
        desc: data.desc ?? null,
        nip: data.nip ?? null,
        email: data.email ?? null,
        phoneNumber: data.phoneNumber ?? null,
        img: data.img ? `${baseUrl}${data.img}` : null,
        imgFile: null,
        backgroundImg: data.backgroundImg ? `${baseUrl}${data.backgroundImg}` : null,
        adress: {
            street: data.adress?.street ?? null,
            city: data.adress?.city ?? null,
            postalCode: data.adress?.postalCode ?? null,
            lattitude: data.adress?.lattitude ?? null,
            longtitude: data.adress?.longtitude ?? null,
        },
        realizations: data.realizations ?? null,
    });
    const fileInputRef = useRef(null);
    const [filePick, setFilePick] = useState(null);
    const {mutate: patchProfileInfo } = useMutation(
        (vars, ctx) => ProfileService.patchProfileInfo(vars, ctx)
    );

    const [removeRealizationList, setRemoveRealizationList] = useState([]);
    const [realizations, setRealizations] = useState([{
        id: 1,
        img: null,
        imgFile: null,
        title: null,
        desc: null,
        loc: null,
        date: null
    }])

    const openPicker = (target) => {
        fileInputRef.current?.click();
        setFilePick(target);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file || !filePick) {
            e.target.value = "";
            return;
        }

        const url = URL.createObjectURL(file);

        switch (filePick.kind) {
        case "pfp":
            setFormData((prev) => ({ ...prev, img: url, imgFile: file }));
            break;
        case "background":
            setFormData((prev) => ({ ...prev, backgroundImg: url, backgroundImgFile: file }));
            break;
        case "realization":
            setRealizations((prev) =>
                prev.map((r) =>
                    r.id === filePick.realizationId ? { ...r, img: url, imgFile: file } : r
                )
            );
            break;
        default:
            break;
        }

        setFilePick(null);
        e.target.value = "";
    };

    const adrSetter = (lat, long, x) => {
        setFormData(prev => ({...prev, adress: {
            ...prev.adress,
            ...(lat && { lattitude: lat }),
            ...(long && { longtitude: long }),
            ...(x.street && { street: x.street }),
            ...(x.city && { city: x.city }),
            ...(x.postalCode && { postalCode: x.postalCode }),
            }
        }));
    };

    const saveChanges = async () => {
        let changeCount = 0;
        const fd = new FormData();

        if(formData.companyName !== data.companyName){ fd.append("CompanyProfileInfo.CompanyName", formData.companyName); changeCount++; }
        if(formData.desc !== data.desc){ fd.append("CompanyProfileInfo.Desc", formData.desc); changeCount++; }
        if(formData.nip !== data.nip){ fd.append("CompanyProfileInfo.Nip", formData.nip); changeCount++; }
        if(formData.email !== data.email){ fd.append("CompanyProfileInfo.Email", formData.email); changeCount++; }
        if(formData.phoneNumber !== data.phoneNumber){ fd.append("CompanyProfileInfo.PhoneNumber", formData.phoneNumber); changeCount++; }

        if (formData.imgFile) {
            fd.append("CompanyProfileInfo.Photo", formData.imgFile);
        }
        if (formData.backgroundImgFile) {
            fd.append("CompanyProfileInfo.BackgroundPhoto", formData.backgroundImgFile);
        }

        if (formData.adress?.street !== data.adress?.street) { fd.append("CompanyProfileInfo.Adress.Street", formData.adress.street); changeCount++; }
        if (formData.adress?.city !== data.adress?.city) { fd.append("CompanyProfileInfo.Adress.City", formData.adress.city); changeCount++; }
        if (formData.adress?.postalCode !== data.adress?.postalCode) { fd.append("CompanyProfileInfo.Adress.PostalCode", formData.adress.postalCode); changeCount++; }
        if (formData.adress?.country !== data.adress?.country) { fd.append("CompanyProfileInfo.Adress.Country", formData.adress.country); changeCount++; }
        if (formData.adress?.longtitude !== data.adress?.longitude) { fd.append("CompanyProfileInfo.Adress.Longtitude", formData.adress.longtitude); changeCount++; }
        if (formData.adress?.lattitude !== data.adress?.latitude) { fd.append("CompanyProfileInfo.Adress.Lattitude", formData.adress.lattitude); changeCount++; }

        if(realizations && realizations.length > 0){
             const items = realizations.map(r => ({
                desc: r?.desc?.trim() || null,
                title: r?.title?.trim() || null,
                date: r?.date ? new Date(r.date).toISOString().slice(0, 10) : null,
                localization: r?.loc?.trim() || null,
                imgFile: r?.imgFile || null,
                }))
                .filter(r => r.desc || r.title || r.date || r.localization || r.imgFile);

            items.forEach((r, i) => {
                if (r.desc) fd.append(`CompanyProfileInfo.NewRealizations[${i}].desc`, r.desc);
                if (r.title) fd.append(`CompanyProfileInfo.NewRealizations[${i}].title`, r.title);
                if (r.date) fd.append(`CompanyProfileInfo.NewRealizations[${i}].date`, r.date);
                if (r.localization) fd.append(`CompanyProfileInfo.NewRealizations[${i}].localization`, r.localization);
                if (r.imgFile) fd.append(`CompanyProfileInfo.NewRealizations[${i}].img`, r.imgFile);
                changeCount++;
            });
        }

        if(removeRealizationList && removeRealizationList.length > 0){
           removeRealizationList.forEach((id, i) => {
                fd.append(`CompanyProfileInfo.RelaizationsToDelete[${i}]`, id);
            });
            changeCount++;
        }

        if(changeCount === 0){ onEdit(); return; }

        const res = await patchProfileInfo(fd);
        if(res.status !== 200 || res.aborted){ showToast(null, "error"); onEdit(); return; }

        showToast("Informacje zapisane", "success");
        onEdit();
    }

    const removeRealization = (relToRemove) => {
        setRemoveRealizationList(prev => [...prev, relToRemove.id]);

        setFormData(prev => ({ ...prev, realizations: prev.realizations?.filter(r => r.id !== relToRemove.id)}));
    };

    if(!data) { return; }

    return (
        <>
            <div className="w-full flex flex-col relative">
                <img onClick={() => openPicker({kind: "background"})} className="h-82 cursor-pointer" src={formData.backgroundImg} />
                <div onClick={() => openPicker({kind: "pfp"})} className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-[50%] cursor-pointer">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <PfpDisplay overlay="true" size="xl" type="Company" source={ formData.img } />
                </div>
            </div>
            <div className="w-full flex flex-col items-center justify-center mt-36 gap-3">
                <div className="relative w-full">
                    <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Nazwa firmy</p>
                    <input type="text" className={`input input-bordered border-black w-full`} 
                        value={formData?.companyName || ""} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                </div>
                <div className="relative w-full">
                    <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Opis</p>
                    <textarea onChange={(e) => setFormData({ ...formData, desc: e.target.value })} value={formData?.desc ?? ""} type="text" className={`textarea textarea-bordered border-black w-full min-h-32 text-md tracking-wide resize-none`} />
                </div>
                <div className="relative w-full">
                    <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Nip</p>
                    <input type="text" className={`input input-bordered border-black w-full`} 
                        value={formData?.nip || ""} onChange={(e) => setFormData({ ...formData, nip: e.target.value })} />
                </div>

                <p className="font-marker text-lg mt-6 tracking-widest">Informacje kontaktowe</p>
                <div className="relative w-full">
                    <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Numer telefonu</p>
                    <input type="text" className={`input input-bordered border-black w-full`} 
                        value={formData?.phoneNumber || ""} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                </div>
                <div className="relative w-full">
                    <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Adres e-mail</p>
                    <input type="text" className={`input input-bordered border-black w-full`} 
                        value={formData?.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>

                <p className="font-marker text-lg mt-6 tracking-widest">Adres</p>
                <div className="w-full">
                    <LocationPicker initial = { {lat: formData.adress?.lattitude ?? 52.2297, lng: formData.adress?.longtitude ?? 21.0122} } zoom={10} onPick={(lat, lng, x) => adrSetter(lat, lng, x)} />
                </div>
                <div className="relative w-full">
                    <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Miasto</p>
                    <input type="text" className={`input input-bordered border-black w-full`} 
                        value={formData?.adress.city || ""} onChange={(e) => setFormData({ ...formData, adress: { ...formData.adress, city: e.target.value } })} />
                </div>
                <div className="relative w-full">
                    <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Ulica</p>
                    <input type="text" className={`input input-bordered border-black w-full`} 
                        value={formData?.adress.street || ""} onChange={(e) => setFormData({ ...formData, adress: { ...formData.adress, street: e.target.value } })} />
                </div>
                <div className="relative w-full">
                    <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Kod pocztowy</p>
                    <input type="text" className={`input input-bordered border-black w-full`} 
                        value={formData?.adress.postalCode || ""} onChange={(e) => setFormData({ ...formData, adress: { ...formData.adress, postalCode: e.target.value } })} />
                </div>

                <p className="font-marker text-lg mt-6 tracking-widest">Realizacje</p>
                <div className="w-full flex flex-row gap-2">
                    {formData.realizations?.map((rel) => (
                        <div className="w-26 h-26 relative">
                            <ImageDisplay size="medium" source={`${baseUrl}${rel.img}`} prevThumb={{ title: rel.title, msg: rel.desc, addons: `${rel.localization} ${rel.date}` }} />
                            <svg onClick={() => removeRealization(rel)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 absolute top-1 right-1 cursor-pointer hover:text-red-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </div>
                    ))}
                </div>

                {realizations.map((rel) => (
                    <div className="w-full flex flex-col gap-3 mb-12" key={rel.id}>
                        <div className="w-full flex flex-row">
                            <div onClick={() => openPicker({ kind: "realization", realizationId: rel.id })} className="w-32 h-auto border cursor-pointer relative">
                                {!rel.img && (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-9 absolute inset-0 m-auto text-gray-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                    </svg>
                                )}
                                <img src={rel.img} className="w-full h-full object-cover"/>
                            </div>
                            <div className="w-full flex flex-col ml-3 gap-3">
                                <div className="relative w-full">
                                    <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Tytuł</p>
                                    <input type="text" className={`input input-bordered border-black w-full`} 
                                        value={rel.title || ""} onChange={(e) => setRealizations(prev => prev.map(r => r.id === rel.id ? { ...r, title: e.target.value } : r))} />
                                </div>
                                <div className="relative w-full">
                                    <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Opis</p>
                                    <textarea value={rel.desc || ""} onChange={(e) => setRealizations(prev => prev.map(r => r.id === rel.id ? { ...r, desc: e.target.value } : r))} type="text" className={`textarea textarea-bordered border-black w-full min-h-14 text-md tracking-wide resize-none`} />
                                </div>
                            </div>
                        </div>
                        <div className="w-full flex flex-row gap-3">
                            <div className="relative w-full">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Lokalizacja</p>
                                <input type="text" className={`input input-bordered border-black w-full`} 
                                        value={rel.loc || ""} onChange={(e) => setRealizations(prev => prev.map(r => r.id === rel.id ? { ...r, loc: e.target.value } : r))} />
                            </div>
                            <div className="relative w-full">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Data</p>
                                <input type="date" className={`input input-bordered border-black w-full`} 
                                        value={rel.date || ""} onChange={(e) => setRealizations(prev => prev.map(r => r.id === rel.id ? { ...r, date: e.target.value } : r))} />
                            </div>
                        </div>
                    </div>
                ))}

                <button onClick={() => setRealizations([...realizations, {id: realizations.length > 0 ? realizations[realizations.length - 1].id + 1 : 1, title: null, desc: null, loc: null, date: null, img: null, imgFile: null}])} className="btn btn-accent w-full tracking-wide -mt-8">dodaj nową</button>

                <button onClick={() => saveChanges()} className="btn btn-success font-marker tracking-widest w-full mt-12">zapisz zmiany</button>
            </div>
        </>
    );
}