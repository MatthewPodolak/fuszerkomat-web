import { useEffect, useState, useRef } from "react";
import { useMutation } from "@/api/hooks/useMutation";
import { useToast } from "@/context/ToastContext";

import { UserTaskService } from "@/api/services/UserTaskService";
import Lottie from "lottie-react";

import Pagination from "@/components/Pagination";
import Status from "@/data/Status.json";
import ActivityIndicator from "@/components/ActivityIndicator";
import TaskPreview from "@/components/TaskPreview";
import EmptyLottie from "@/assets/lotties/empty.json";


export default function TaskPanel(){
    const initialLoad = useRef(false);
    const lottieRef = useRef();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [paginationState, setPaginationState] = useState(null);
    const [taskData, setTaskData] = useState();
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [currentStatuses, setCurrentStatuses] = useState([]);

    const { mutate: getOwn } = useMutation(
        (vars, ctx) => UserTaskService.getOwn(vars, ctx)
    );

    const search = async () => {
        if(JSON.stringify(currentStatuses) === JSON.stringify(selectedStatuses)){ return; }

        const query = new URLSearchParams({ page: String(1), pageSize: "50" });
        if (selectedStatuses && selectedStatuses.length > 0) { query.set("statuses", selectedStatuses.join(",")); }
        
        const res = await getOwn(query);
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
        if (currentStatuses && currentStatuses.length > 0) { query.set("statuses", currentStatuses.join(",")); }
        
        const res = await getOwn(query);
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
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-3 px-3 bg-primary">
                <div className="w-full flex flex-wrap gap-2 sm:gap-3">
                    {Status.map((st) => {
                        const isSelected = selectedStatuses.includes(st.val);
                        return (
                        <div key={st.val} onClick={() => setSelectedStatuses((prev) => isSelected ? prev.filter((v) => v !== st.val) : [...prev, st.val] )}
                            className={`px-3 py-1 border border-accent rounded-full cursor-pointer transition-colors ${isSelected ? "bg-accent text-secondary" : "text-accent hover:bg-accent hover:text-secondary"} `}>
                            <p>{st.name}</p>
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
                                <div key={task.id} className="w-full">
                                    <TaskPreview data={task} type="user" />
                                </div>
                            ))}
                            <div className="w-full flex items-center justify-center mb-12">
                                <Pagination pagination={paginationState} onPageChange={(nextPage) => fetchPage(nextPage)} showWhenSingle />
                            </div>
                        </div>
                    ):(
                        <div className="items-center w-full flex flex-col mt-12 mb-24">
                            <Lottie lottieRef={lottieRef} animationData={EmptyLottie} loop autoplay className="w-full max-w-[500px] md:max-w-[700px] aspect-square -mt-12" />
                            <p className="text-2xl font-marker tracking-widest text-center">Zadnych ogloszen. A robota czeka...</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}