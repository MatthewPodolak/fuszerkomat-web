import { useState, useRef, useEffect } from "react"
import { useMutation } from "@/api/hooks/useMutation";
import { useToast } from "@/context/ToastContext";
import { OpinionService } from "@/api/services/OpinionService";
import Lottie from "lottie-react";

import UserOpinionDisplay from "@/components/UserOpinionDisplay";
import Pagination from "@/components/Pagination";
import ActivityIndicator from "@/components/ActivityIndicator";
import EmptyLottie from "@/assets/lotties/empty.json";

const OPINION_TYPES = [{ name: "Ocenione", val: "Rated" }, { name: "Nie Ocenione", val: "NotRated" }];

export default function OpinionPanel(){
    const initialLoad = useRef(false);
    const lottieRef = useRef();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [paginationState, setPaginationState] = useState(null);
    const [opinionData, setOpinionData] = useState();
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [currentTypes, setCurrentTypes] = useState([]);

    const { mutate: getAll } = useMutation(
        (vars, ctx) => OpinionService.getAll(vars, ctx)
    );

    const search = async () => {
        if(JSON.stringify(currentTypes) === JSON.stringify(selectedTypes)){ return; }

        const query = new URLSearchParams({ page: String(1), pageSize: "50" });
        if (selectedTypes && selectedTypes.length > 0) { query.set("types", selectedTypes.join(",")); }
        
        const res = await getAll(query);
        if(res.status !== 200 || res.aborted){ showToast(null, "error"); return; }

        setCurrentTypes(selectedTypes);
        const { data, pagination } = res;
        setOpinionData(data);
        setPaginationState(pagination);
    }

    const fetchPage = async (pageNumber) => {
        if(pageNumber === paginationState?.currentPage){ return; }

        setIsLoading(true);
        const query = new URLSearchParams({ page: String(pageNumber), pageSize: "50", });
        if (currentTypes && currentTypes.length > 0) { query.set("types", currentTypes.join(",")); }
        
        const res = await getAll(query);
        setIsLoading(false);
        if (!res || res.status !== 200 || res.aborted) { showToast("Nie udało się wczytać zleceń", "error"); return; }

        const { data, pagination } = res;
        setOpinionData(data);
        setPaginationState(pagination);
    }

    useEffect(() => {
        if (!initialLoad.current) {
            initialLoad.current = true;
            fetchPage(1);
        }
    }, []);

    return (
        <div className="w-full h-auto flex flex-col">
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-3 px-3 bg-primary">
                <div className="w-full flex flex-wrap gap-2 sm:gap-3">
                    {OPINION_TYPES.map((type) => {
                        const isSelected = selectedTypes.includes(type.val);
                        return (
                        <div key={type.val} onClick={() => setSelectedTypes((prev) => isSelected ? prev.filter((v) => v !== type.val) : [...prev, type.val] )}
                            className={`px-3 py-1 border border-accent rounded-full cursor-pointer transition-colors ${isSelected ? "bg-accent text-secondary" : "text-accent hover:bg-accent hover:text-secondary"} `}>
                            <p>{type.name}</p>
                        </div>
                        );
                    })}
                </div>
                <button onClick={() => search()} className="btn btn-success font-marker tracking-widest px-6">ZASTOSUJ</button>
            </div>
            {isLoading ? (
                <div className="w-full flex flex-col min-h-128 items-center justify-center">
                    <ActivityIndicator size="medium" />
                </div>
            ):( 
                <>
                    {opinionData && opinionData.length > 0 ? (
                        <div className="w-full flex flex-col gap-3 mt-3">
                            {opinionData.map((op) => (
                                <UserOpinionDisplay data={op} />
                            ))}
                            <div className="w-full flex items-center justify-center mb-12">
                                <Pagination pagination={paginationState} onPageChange={(nextPage) => fetchPage(nextPage)} showWhenSingle />
                            </div>
                        </div>
                    ):(
                        <div className="items-center w-full flex flex-col mt-12 mb-24">
                            <Lottie lottieRef={lottieRef} animationData={EmptyLottie} loop autoplay className="w-full max-w-[500px] md:max-w-[700px] aspect-square -mt-12" />
                            <p className="text-2xl font-marker tracking-widest">Tutaj pojawia sie mozliwe oceny, narazie pusto.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}