import TaskBrowser from "@/components/TaskBrowser";
import Lottie from "lottie-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { useMutation } from "@/api/hooks/useMutation";
import { CompanyTaskService } from "@/api/services/CompanyTaskService";

import ActivityIndicator from "@/components/ActivityIndicator";
import Pagination from "@/components/Pagination";
import CompanyTaskPreview from "@/components/CompanyTaskPreview";

import EmptyLottie from "@/assets/lotties/empty.json";

const EMPTY_SEARCH_PARAMS = {
    keyWords: null,
    sort: null,
    category: null,
    tags: [],
    location: {
        radius: 10,
        lat: null,
        long: null,
        name: null
    }
};

export default function CompanyHome() {
    const { showToast } = useToast();
    const initialLoad = useRef(false);
    const lottieRef = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [loaded, setLoaded] = useState(null);
    const [paginationState, setPaginationState] = useState(null);
    const [lastParams, setLastParams] = useState(EMPTY_SEARCH_PARAMS);
    const { mutate: getTasks } = useMutation(
        (vars, ctx) => CompanyTaskService.getTasks(vars, ctx)
    );

    const search = async (recivedData) => {
        if(JSON.stringify(recivedData) === JSON.stringify(lastParams)){ console.log("SAME"); return; }
        setIsLoading(true);

        const query = new URLSearchParams({
            Page: "1",
            PageSize: "50",
            ...(recivedData.keyWords ? { KeyWords: recivedData.keyWords } : {}),
            ...(recivedData.sort ? { SortOptions: recivedData.sort } : {}),
            ...(recivedData.category ? { CategoryType: recivedData.category } : {}),
            ...(recivedData.location?.lat && recivedData.location?.long
                ? {
                      "Location.Latitude": recivedData.location.lat,
                      "Location.Longtitude": recivedData.location.long,
                      "Location.Range": recivedData.location.radius ?? 10,
                  }
                : {}),
        });
        const res = await getTasks(query);
        setIsLoading(false);
        if (!res || res.status !== 200 || res.aborted) { showToast("Nie udało się wczytać zleceń", "error"); return; }

        const { data, pagination } = res;
        setLoaded(data);
        setPaginationState(pagination);
        setLastParams(recivedData);
    };

    const fetchPage = async (pageNumber) => {
        if(pageNumber === paginationState?.currentPage){ return; }
        setIsLoading(true);

        const query = new URLSearchParams({ page: String(pageNumber), pageSize: "50", }); //TODO - ALONG WITH PARAMS IF ANY.
        const res = await getTasks(query);

        setIsLoading(false);
        if (!res || res.status !== 200 || res.aborted) { showToast("Nie udało się wczytać zleceń", "error"); return; }

        const { data, pagination } = res;
        setLoaded(data);
        setPaginationState(pagination);
    };

    useEffect(() => {
        if (!initialLoad.current) {
            initialLoad.current = true;
            fetchPage(1);
        }
    }, []);

    return (
        <>
        <div className="w-full min-h-screen bg-whitesmoke flex items-start justify-center">
            <div className="w-full max-w-7xl px-6 mt-12 gap-3 flex flex-col">
                <TaskBrowser onSearch={search}/>
                <div className="w-full flex flex-col gap-3 min-h-128">
                    {isLoading ? (
                        <ActivityIndicator size="medium"/>
                    ):(
                        <>
                            {loaded && loaded.length > 0 ? (
                                <>
                                    {loaded.map((task) => (
                                        <CompanyTaskPreview data={task} key={task.id} />
                                    ))}
                                    <div className="w-full flex items-center justify-center mb-12">
                                        <Pagination pagination={paginationState} onPageChange={(nextPage) => fetchPage(nextPage)} showWhenSingle />
                                    </div>
                                </>
                            ):(
                                <div className="items-center w-full flex flex-col mb-24">
                                    <Lottie
                                        lottieRef={lottieRef}
                                        animationData={EmptyLottie} loop autoplay
                                        className="w-full max-w-[500px] md:max-w-[700px] aspect-square -mt-12"
                                    />
                                    <p className="text-2xl font-marker tracking-widest">Zadnych ogloszen. Wszyscy odpoczywaja... ty tez powinienes.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}