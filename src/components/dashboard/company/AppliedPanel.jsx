import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useMutation } from "@/api/hooks/useMutation";
import { useToast } from "@/context/ToastContext";
import { CompanyTaskService } from "@/api/services/CompanyTaskService";
import Lottie from "lottie-react";

import ApplicationStatus from "@/data/ApplicationStatus.json";
import Pagination from "@/components/Pagination";
import ActivityIndicator from "@/components/ActivityIndicator";
import EmptyLottie from "@/assets/lotties/empty.json";
import AppliedTaskPreview from "@/components/AppliedTaskPreview";

export default function AppliedPanel(){
    const initialLoad = useRef(false);
    const lottieRef = useRef();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [paginationState, setPaginationState] = useState(null);
    const [taskData, setTaskData] = useState();
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [currentStatuses, setCurrentStatuses] = useState([]);
    const { mutate: getApplied } = useMutation(
        (vars, ctx) => CompanyTaskService.getAppliedTasks(vars, ctx)
    );

    const search = async () => {
        if(JSON.stringify(currentStatuses) === JSON.stringify(selectedStatuses)){ return; }

        const query = new URLSearchParams({ page: String(1), pageSize: "50" });
        if (selectedStatuses && selectedStatuses.length > 0) { selectedStatuses.forEach(s => query.append("statuses", s)); }
        
        const res = await getApplied(query);
        if(res.status !== 200 || res.aborted){ showToast(null, "error"); return; }

        setCurrentStatuses(selectedStatuses);
        const { data, pagination } = res;
        setTaskData(data);
        setPaginationState(pagination);
    };

    const fetchPage = async (pageNumber) => {
        if(pageNumber === paginationState?.currentPage){ return; }

        setIsLoading(true);
        const query = new URLSearchParams({ page: String(pageNumber), pageSize: "50", });
        if (currentStatuses && currentStatuses.length > 0) { selectedStatuses.forEach(s => query.append("statuses", s)); }
        
        const res = await getApplied(query);
        setIsLoading(false);
        if (!res || res.status !== 200 || res.aborted) { showToast("Nie udało się wczytać zleceń", "error"); return; }

        const { data, pagination } = res;
        setTaskData(data);
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
            <div className="w-full flex flex-row items-center py-3 px-3 justify-center bg-primary">
                <div className="w-full flex flex-row gap-3">
                    {ApplicationStatus.map((st) => {
                        const isSelected = selectedStatuses.includes(st.val);
                        return (
                            <div key={st.val} onClick={() => setSelectedStatuses((prev) => isSelected ? prev.filter((v) => v !== st.val) : [...prev, st.val] )}
                                className={`px-3 py-1 border border-accent rounded-full cursor-pointer transition-colors ${isSelected ? "bg-accent text-secondary" : "text-accent hover:bg-accent hover:text-secondary"} `}>
                                <p>{st.normalized}</p>
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
                    {taskData && taskData.length > 0 ? (
                        <div className="w-full flex flex-col gap-3 mt-3">
                            {taskData.map((task) => (
                                <div onClick={() => navigate(`/company/tasks/${task.id}`)} key={task.id}>
                                    <AppliedTaskPreview data={task} />
                                </div>
                            ))}
                            <div className="w-full flex items-center justify-center mb-12">
                                <Pagination pagination={paginationState} onPageChange={(nextPage) => fetchPage(nextPage)} showWhenSingle />
                            </div>
                        </div>
                    ):(
                        <div className="items-center w-full flex flex-col mt-12 mb-24">
                            <Lottie lottieRef={lottieRef} animationData={EmptyLottie} loop autoplay className="w-full max-w-[500px] md:max-w-[700px] aspect-square -mt-12" />
                            <p className="text-2xl font-marker tracking-widest">Brak aplikacji? Wez sie za robote.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}