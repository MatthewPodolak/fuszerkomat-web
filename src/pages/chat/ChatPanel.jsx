import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@/api/hooks/useMutation";
import { ChatService } from "@/api/services/ChatService";
import { useToast } from "@/context/ToastContext";

import ActivityIndicator from "@/components/ActivityIndicator";
import ChatPreview from "@/components/ChatPreview";

export default function ChatPanel(){
    const { id } = useParams();
    const { showToast } = useToast();

    const initialLoad = useRef(false);
    const [convosDataLoading, setConvosDataLoading] = useState(true);
    const [convosData, setConvosData] = useState(null);

    const [selectedConvo, setSelectedConvo] = useState(null);
    const [selectedConvoLoading, setSelectedConvoLoading] = useState(false);
    
    const {mutate: getChats } = useMutation(
        (_vars, ctx) => ChatService.getChats(ctx)
    );

    const selectChat = (convId) => {
        if(selectedConvo === convId){ setSelectedConvo(null); return; }
        setSelectedConvo(convId);
        setSelectedConvoLoading(true);

        //connect grpc + display?
        setSelectedConvoLoading(false);
    };

    const fetchConversations = async () => {
        setConvosDataLoading(true);
        const res = await getChats();
        setConvosDataLoading(false);
        if(res.status !== 200 || res.aborted){ showToast("Nie udało się wczytać konwersacji"); return; }

        setConvosData(res.data);
    };

    useEffect(() => {
        if (!initialLoad.current) {
            initialLoad.current = true;
            fetchConversations();
        }
    }, []);

    useEffect(() => {
        if (id) {
            setSelectedConvo(id);
        }
    }, [id]);

    return (
        <div className="w-full h-auto min-h-screen py-12 flex bg-whitesmoke justify-center items-center">
            <div className="w-7xl max-h-256 flex flex-row shadow-2xl border border-gray-200">
                <div className="w-[40%] bg-whitesmoke">
                    {convosDataLoading ? (
                        <div className="w-full max-h-256 flex flex-col items-center justify-center"><ActivityIndicator size="medium" /></div>
                    ):(
                        <>
                            <div className="w-full h-12 bg-primary flex flex-row items-center gap-2">
                                <p className="text-lg ml-3 font-marker text-accent tracking-widest">konwersacje</p>
                            </div>
                            <div>
                                {!convosDataLoading && convosData.length > 0 ? (                                
                                    <div className="w-full h-256 flex flex-col overflow-scroll">
                                        {convosData.map((conv) => (
                                            <ChatPreview data={conv} key={conv.conversationId} onSelect={selectChat} selected={selectedConvo === conv.conversationId ? true : false} />
                                        ))}
                                    </div>
                                ):(
                                    <div className="w-full h-256 flex flex-col items-center justify-center gap-6">
                                        <p className="text-6xl font-marker rotate-90">: (</p>
                                        <p className="font-marker text-xl">brak konwersacji</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <div className="w-full h-256 shadow-lg">
                    {selectedConvoLoading ? (
                        <div className="w-full h-256 flex flex-col items-center justify-center -mt-6"><ActivityIndicator size="medium" /></div>
                    ):(
                        <>
                            {!selectedConvo ? (
                                <></>
                            ):(
                                <div className="w-full h-256 flex flex-col">
                                    <div className="w-full h-18 bg-primary">

                                    </div>
                                    <div className="w-full h-full bg-whitesmoke">

                                    </div>
                                    <div className="w-full h-24 bg-primary rounded-t-3xl flex flex-row items-center px-3 gap-3">
                                        <input className="w-full input bg-whitesmoke rounded-full" />
                                        <div className="btn btn-accent w-12 h-12 rounded-full p-0! flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}