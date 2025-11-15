import { useState, useRef } from "react";
import { useMutation } from "@/api/hooks/useMutation";
import { useToast } from "@/context/ToastContext";
import { OpinionService } from "@/api/services/OpinionService";
import Categories from "@/data/Categories.json";
import Lottie from "lottie-react";

import PfpDisplay from "@/components/dashboard/PfpDisplay";
import StarsLottie from "@/assets/lotties/stars.json";

export default function UserOpinionDisplay({data}){
    const { showToast } = useToast();
    const lottieRef = useRef();  
    const [selectedMenu, setSelectedMenu] = useState("task");

    const [opinionWrapperVisible, setOpinionWrapperVisible] = useState(false);
    const [selectedCompanyOpinion, setSelectedCompanyOpinion] = useState({rating: null, comment: "", companyId: null, taskId: null});
    const { mutate: rateCompany } = useMutation(
        (vars, ctx) => OpinionService.rateCompany(vars, ctx)
    );

    const category = Categories.find(a=>a.category === data?.taskData?.category);
    const allTags = Categories.flatMap((cat) => cat.tags.map((tag) => ({ ...tag })));
    const tags = allTags.filter(tag => data?.taskData?.tags.includes(tag.name));

    const rate = async () => {
        if(!selectedCompanyOpinion.rating || !selectedCompanyOpinion.companyId || !selectedCompanyOpinion.taskId){ return; }

        const res = await rateCompany(selectedCompanyOpinion);
        if(res.status !== 200 || res.aborted){ showToast(null, "error"); setOpinionWrapperVisible(false); return; }

        showToast("Poprawnie zamieszczono opinie!", "success");
        setOpinionWrapperVisible(false);
        return;
    };

    const generateContent = () => {
        switch(selectedMenu){
            case "task":
                return (
                    <div className="w-full flex flex-col items-center justify-center gap-2 py-3">
                        <p className="text-lg font-marker tracking-widest">{data?.taskData?.name}</p>
                        <p className="text-md tracking-wider text-center" >{data?.taskData?.desc}</p>
                        <div className="w-full flex flex-row items-center justify-end gap-2 mt-3">
                            <div className="rounded-full px-3 py-1 text-sm text-white" style={{ backgroundColor: category.color }}>{category.name} </div>
                            {tags?.map((tag) => (
                                <div key={tag.name} className="rounded-full px-3 py-1 text-sm border">{tag.name}</div>
                            ))}
                        </div>
                    </div>
                );
            case "opinion":
                return (
                    <div className="w-full flex flex-col items-center justify-center gap-2 py-3">
                        {data?.companyRating ? (
                            <>
                                <div className="rating rating-half rating-xl mt-3">
                                    {Array.from({ length: 10 }).map((_, i) => {
                                        const rating = data.companyRating.rating;
                                        const halfSteps = Math.round(rating * 2);

                                        const base = "mask mask-star-2";
                                        const halfClass = i % 2 === 0 ? "mask-half-1" : "mask-half-2";
                                        const filled = i < halfSteps;
                                        const colorClass = filled ? "bg-accent" : "bg-primary opacity-30";

                                        const checked = i + 1 === halfSteps;

                                        return (
                                            <input key={i} type="radio" className={`${base} ${halfClass} ${colorClass}`} readOnly checked={checked}/>
                                        );
                                    })}
                                </div>
                                <p className="font-marker text-md tracking-widest">( {data?.companyRating?.rating} / 5 )</p>
                                {data?.companyRating?.comment && (
                                    <p className="font-marker text-lg tracking-widest">" {data.companyRating.comment} "</p>
                                )}
                            </>
                        ) : (
                            <>
                                <Lottie lottieRef={lottieRef} animationData={StarsLottie} loop={false} autoplay className="w-full h-18" />
                                <p className="font-marker tracking-widest text-primary text-lg">Podobalo sie? Nie warto? Daj znac innym.</p>
                                <p onClick={() => {setOpinionWrapperVisible(true); setSelectedCompanyOpinion({rating: null, comment: "", companyId: data?.companyId, taskId: data?.taskData?.taskId}); }} className="font-marker tracking-widest text-accent text-lg hover:underline underline-offset-8 decoration-2 cursor-pointer">DODAJ OPINIE</p>
                            </>
                        )}
                    </div>
                );
        }
    };

    if(!data){ return null; }

    return (
        <>
            <div className="w-full min-h-24 border rounded-2xl flex flex-row py-6 px-9">
                <div className="w-1/5 flex flex-col items-center justify-center gap-3">
                    <PfpDisplay size="large" />
                    <p className="text-md text-center tracking-wider font-marker">{data.companyName}</p>
                </div>
                <div className="w-full ml-12">
                    <div className="w-full flex flex-row gap-3">
                        <p onClick={() => setSelectedMenu("task")} className={`text-md text-center tracking-wider font-marker cursor-pointer hover:text-accent ${selectedMenu === "task" ? `text-accent` : ""} `}>Zlecenie</p>
                        <p onClick={() => setSelectedMenu("opinion")} className={`text-md text-center tracking-wider font-marker cursor-pointer hover:text-accent ${selectedMenu === "opinion" ? `text-accent` : ""} `}>Opinia</p>
                    </div>

                    { generateContent() }
                </div>
                
            </div>

            {opinionWrapperVisible && (
                <div onClick={() => setOpinionWrapperVisible(false)} className="fixed inset-0 bg-black/20 z-999 flex items-center justify-center">
                    <div onClick={(e) => e.stopPropagation()} className="w-1/2 min-h-64 bg-base-100 rounded-2xl flex flex-col items-center p-12 relative">
                        <p className="font-marker tracking-widest text-xl">Napisz co myslisz. Albo moze lepiej nie...</p>
                        <div className="w-full flex justify-center rating rating-xl rating-half mt-6 leading-none">
                            <input onChange={() => setSelectedCompanyOpinion(prev => ({ ...prev, rating: 0 }))} type="radio" name="rating-11" className="rating-hidden" value="0" />

                            <input onChange={() => setSelectedCompanyOpinion(prev => ({ ...prev, rating: 0.5 }))} type="radio" name="rating-11" value="0.5" className="mask mask-star-2 mask-half-1 bg-accent" />
                            <input onChange={() => setSelectedCompanyOpinion(prev => ({ ...prev, rating: 1 }))} type="radio" name="rating-11" value="1"   className="mask mask-star-2 mask-half-2 bg-accent" />

                            <input onChange={() => setSelectedCompanyOpinion(prev => ({ ...prev, rating: 1.5 }))} type="radio" name="rating-11" value="1.5" className="mask mask-star-2 mask-half-1 bg-accent" />
                            <input onChange={() => setSelectedCompanyOpinion(prev => ({ ...prev, rating: 2 }))} type="radio" name="rating-11" value="2"   className="mask mask-star-2 mask-half-2 bg-accent" />

                            <input onChange={() => setSelectedCompanyOpinion(prev => ({ ...prev, rating: 2.5 }))} type="radio" name="rating-11" value="2.5" className="mask mask-star-2 mask-half-1 bg-accent" />
                            <input onChange={() => setSelectedCompanyOpinion(prev => ({ ...prev, rating: 3 }))} type="radio" name="rating-11" value="3"   className="mask mask-star-2 mask-half-2 bg-accent" />

                            <input onChange={() => setSelectedCompanyOpinion(prev => ({ ...prev, rating: 3.5 }))} type="radio" name="rating-11" value="3.5" className="mask mask-star-2 mask-half-1 bg-accent" />
                            <input onChange={() => setSelectedCompanyOpinion(prev => ({ ...prev, rating: 4 }))} type="radio" name="rating-11" value="4"   className="mask mask-star-2 mask-half-2 bg-accent" defaultChecked />

                            <input onChange={() => setSelectedCompanyOpinion(prev => ({ ...prev, rating: 4.5 }))} type="radio" name="rating-11" value="4.5" className="mask mask-star-2 mask-half-1 bg-accent" />
                            <input onChange={() => setSelectedCompanyOpinion(prev => ({ ...prev, rating: 5 }))} type="radio" name="rating-11" value="5"   className="mask mask-star-2 mask-half-2 bg-accent" />
                        </div>
                        <div className="relative w-full mt-9">
                            <p className="absolute -top-2 left-3 bg-base-100 text-sm px-1 text-black z-10">Komentarz</p>
                            <textarea value={selectedCompanyOpinion?.comment || ""} onChange={(e) => setSelectedCompanyOpinion(prev => ({ ...prev, comment: e.target.value }))} type="text" className={`textarea textarea-bordered border-black w-full min-h-22 text-md tracking-wide resize-none`} />
                        </div>
                        <button onClick={() => rate()} className="w-full btn btn-success font-marker tracking-widest mt-3">wystaw opinie</button>

                        <svg onClick={() => setOpinionWrapperVisible(false)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 absolute top-5 right-5 cursor-pointer">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>
            )}
        </>
    );
}