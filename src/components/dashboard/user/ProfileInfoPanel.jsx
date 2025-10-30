import { useState } from "react";
import PfpDisplay from "../PfpDisplay";

export default function ProfileInfoPanel(){
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="w-full h-auto p-12 bg-base-100 rounded-2xl shadow-2xl flex flex-row gap-12 relative">
            {isEditing ? (
                <>
                    <div className="w-full h-auto flex flex-col items-center relative">
                        <PfpDisplay overlay="true" size="xl" type="User" />
                        <div className="w-102 mt-12 flex flex-col gap-6">
                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Imie</p>
                                <input type="text" className={`input input-bordered border-black w-full`} />
                            </div>
                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Nazwiko</p>
                                <input type="text" className={`input input-bordered border-black w-full`} />
                            </div>
                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Mail kontaktowy</p>
                                <input type="text" className={`input input-bordered border-black w-full`} />
                            </div>
                            <div className="relative">
                                <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Numer telefonu</p>
                                <input type="text" className={`input input-bordered border-black w-full`} />
                            </div>
                            <button className="btn btn-success font-marker tracking-widest" >zapisz zmiany</button>
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
                    <PfpDisplay size="xl" type="User" />
                    <div className="flex flex-col gap-6">
                        <div>
                            <p className="font-marker text-accent">Imie i nazwisko</p>
                            <p className="font-marker tracking-[0.4rem] text-2xl">Mateusz Podolak</p>
                        </div>
                        <div>
                            <p className="font-marker text-accent">Adres e-mail do kontaktu</p>
                            <p className="font-marker tracking-[0.4rem] text-2xl">aaaaa@gmail.com</p>
                        </div>
                        <div>
                            <p className="font-marker text-accent">Telefon kontaktowy</p>
                            <p className="font-marker tracking-[0.4rem] text-2xl">+48 515 515 515</p>
                        </div>
                    </div>

                    <div onClick={() => setIsEditing(true)} className="absolute right-10 top-10 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </div>
                </>
            )}
        </div>
    );
}