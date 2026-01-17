import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@/api/hooks/useMutation";
import { useToast } from "@/context/ToastContext";
import { UserTaskService } from "@/api/services/UserTaskService";

import Categories from "@/data/Categories.json";
import ActivityIndicator from "@/components/ActivityIndicator";
import PfpDisplay from "@/components/dashboard/PfpDisplay";
import MapPin from "@/components/MapPin";
import ImageDisplay from "@/components/ImageDisplay";

const baseUrl = import.meta.env.VITE_API_ORIGIN;

export default function TaskDisplay() {
    const { id } = useParams();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const initialLoad = useRef(false);
    const [isLoading, setIsLoading] = useState(true);
    const [taskData, setTaskData] = useState(null);
    const [category, setCategory] = useState(null);
    const [tags, setTags] = useState([]);

    const { mutate: getById } = useMutation(
        (vars, ctx) => UserTaskService.getById(vars, ctx)
    );

    const fetchData = async (taskId) => {
        const res = await getById(taskId);
        if(res.status !== 200 || res.aborted || !res.data){ showToast(null, "error"); navigate("/error");  return; }

        setTaskData(res.data);
        const category = Categories.find(a=>a.category === res.data.category);
        const allTags = Categories.flatMap((cat) => cat.tags.map((tag) => ({ ...tag })));
        const tags = allTags.filter(tag => res.data.tags.includes(tag.tagName));
        setCategory(category); 
        setTags(tags);
        setIsLoading(false);
    };

    useEffect(() => {
        if (!initialLoad.current) {
            initialLoad.current = true;
            fetchData(id);
        }
    }, []);

    return (
        <div className="w-full min-h-256 relative flex items-center justify-center bg-gray-100 py-12">
            <div className="min-w-5xl min-h-256 relative mb-24">

                <div className="max-w-5xl bg-whitesmoke border border-gray-300 rounded-2xl shadow-2xl flex flex-col p-12 sticky z-10 gap-3">
                    {isLoading ? (
                        <div className="w-full flex items-center justify-center"><ActivityIndicator size="medium"/></div>
                    ):(
                        <>
                            <div className="w-full flex flex-row gap-2 items-center justify-center mb-6">
                                <div className="rounded-full px-3 py-1 text-sm text-white" style={{ backgroundColor: category.color }}>{category.name} </div>
                                {tags?.map((tag) => (
                                    <div key={tag.name} className="rounded-full px-3 py-1 text-sm border">{tag.name}</div>
                                ))}
                            </div>
                            <p className="text-3xl tracking-widest text-center font-marker mb-3">{taskData.name}</p>
                            <p className="text-lg tracking-wide justify-center flex mb-6 text-center">{taskData.desc}</p>
                            <div className="w-full flex flex-row gap-3 items-center justify-center">
                                {taskData.images?.map((img) => (
                                    <ImageDisplay key={img} source={`${baseUrl}${img}`}/>
                                ))}
                            </div>
                            <div className="w-full flex">
                            <MapPin
                                lat={
                                    taskData.location?.latitude && taskData.location.latitude !== 0
                                    ? taskData.location.latitude
                                    : 52.2297
                                }
                                lng={
                                    taskData.location?.longtitude && taskData.location.longtitude !== 0
                                    ? taskData.location.longtitude
                                    : 21.0122
                                }
                                zoom={14}
                            />
                            </div>
                            <div className="-mx-12 -mb-12 px-12 rounded-xl bg-primary-content">
                                <div className="w-full flex flex-row items-center justify-between py-4">
                                    <div className="w-full flex flex-col">
                                        <p className="tracking-widest text-3xl text-primary font-marker"> {taskData.requestingUserDataVMO.name} </p>
                                        <div className="w-full flex flex-row items-center gap-3">
                                            {taskData.requestingUserDataVMO?.phone && (
                                                <div className="flex flex-row items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                                    </svg>
                                                    <p>{taskData.requestingUserDataVMO.phone}</p>
                                                </div>
                                            )}
                                            {taskData.requestingUserDataVMO?.email && (
                                                <div className="flex flex-row items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                                    </svg>
                                                    <p>{taskData.requestingUserDataVMO.email}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <PfpDisplay size="large" type="User" source={`${baseUrl}${taskData.requestingUserDataVMO.pfp}`} />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="absolute flex flex-col items-center p-3 gap-3 w-24 min-h-82 border border-gray-300 bg-whitesmoke -left-22 top-5 rounded-2xl z-0 shadow-2xl">
                    {taskData?.applicants?.length > 0 ? (
                        <>
                            {taskData.applicants.map((apk) => (
                                <div onClick={() => navigate(`/company/${apk.id}`)} className="cursor-pointer"><PfpDisplay size="medium" type="Company" source={`${baseUrl}${apk.pfp}`}/></div>
                            ))}
                        </>
                    ):(
                        <></>
                    )}
                </div>

            </div>
        </div>
    );
}