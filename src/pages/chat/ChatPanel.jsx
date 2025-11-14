import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@/api/hooks/useMutation";
import { ChatService } from "@/api/services/ChatService";
import { UserTaskService } from "@/api/services/UserTaskService";
import { useToast } from "@/context/ToastContext";
import ChatApi from "@/api/chatClient";
import { tokenStore } from "@/api/tokenStore.js";
import { getJwtClaim } from "@/helpers/jwtHelper";

import ActivityIndicator from "@/components/ActivityIndicator";
import ChatPreview from "@/components/ChatPreview";
import ApplicationStatus from "@/data/ApplicationStatus.json";

export default function ChatPanel(){
    const { id } = useParams();
    const { showToast } = useToast();
    const [userId, setUserId] = useState(() => {
        const t = tokenStore.get();
        return getJwtClaim(t, "sub") ?? getJwtClaim(t, "nameid");
    });

    const initialLoad = useRef(false);
    const [convosDataLoading, setConvosDataLoading] = useState(true);
    const [convosData, setConvosData] = useState(null);

    const [selectedConvo, setSelectedConvo] = useState(null);
    const [selectedConvoData, setSelectedConvoData] = useState(null);
    const [selectedConvoLoading, setSelectedConvoLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const stopStreamRef = useRef(null);
    const api = useMemo(() => new ChatApi(), []);
    
    const {mutate: getChats } = useMutation(
        (_vars, ctx) => ChatService.getChats(ctx)
    );
    const {mutate: changeApplicationStatus } = useMutation(
        (vars, ctx) => UserTaskService.changeApplicationStatus(vars, ctx)
    );
    const { mutate: markAsCompleted } = useMutation(
        (vars, ctx) => UserTaskService.markAsCompleted(vars, ctx)
    );

    const changeStatus = async (newStatus) => {
        if(!newStatus){ return; }

        let model = { workTaskId: selectedConvoData.taskData.id, companyId: selectedConvoData.corespondentId, answer: newStatus };
        const res = await changeApplicationStatus(model);
        if(res.status !== 200 || res.aborted){ showToast("Nie udało się zmienić statusu.", "error"); return; }

        showToast("Pomyślnie zmieniono status", "success");
        switch (newStatus) {
            case "Accept":
                setSelectedConvoData(prev => ({...prev, taskData: { ...prev.taskData, status: "Closed" }}));
                break;

            case "Reject":
                  setSelectedConvoData(prev => ({...prev, isArchived: true }));
                break;
        }
    };

    const markTaskAsCompleted = async () => {
        let model = { workTaskId: selectedConvoData.taskData.id, companyId: selectedConvoData.corespondentId };
        const res = await markAsCompleted(model);
        if(res.status !== 200 || res.aborted){ showToast(null, "error"); return; }

        showToast("pomyślnie zmieniono status.", "success");
        setSelectedConvoData(prev => ({...prev, taskData: { ...prev.taskData, status: "Completed" }}));
    }

    const send = async () => {
        const text = (input || "").trim();
        if (!text || !selectedConvo) return;

        setInput("");

        const me = userId;
        if(!me){ showToast("nie udało się wysłać wiadomośći", "error"); return; }

        const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const optimistic = {
            id: tempId,
            from: me,
            text,
            ts: new Date().toISOString(),
            optimistic: true,
        };
        setMessages((curr) => [...curr, optimistic]);

        const rollback = () =>
            setMessages((curr) => curr.filter((m) => m.id !== tempId));

        try {
            await api.sendMessage({ conversationId: selectedConvo, senderId: me, text, });
        } catch (e) {
            if (e?.code === 16) {
                setTimeout(async () => {
                    try {
                    await api.sendMessage({ conversationId: selectedConvo, senderId: me, text, });
                    } catch (err2) {
                        rollback();
                        showToast("Nie udało się wysłać wiadomości", "error");
                    }
                }, 800);
            } 
            else {
                rollback();
                showToast("Nie udało się wysłać wiadomości", "error");
            }
        }
    };


    const selectChat = (selectedConvData) => {
        if (selectedConvo === selectedConvData.conversationId) { 
            stopStreamRef.current?.();
            stopStreamRef.current = null;
            setSelectedConvo(null);
            setSelectedConvoData(null);
            setMessages([]);
            return; 
        }

        setSelectedConvo(selectedConvData.conversationId);
        setSelectedConvoData(selectedConvData);
        setSelectedConvoLoading(true);
    };

    const fetchConversations = async () => {
        setConvosDataLoading(true);
        const res = await getChats();
        setConvosDataLoading(false);
        if(res.status !== 200 || res.aborted){ showToast("Nie udało się wczytać konwersacji"); return; }

        const sorted = (res.data ?? []).slice().sort((a, b) => {
            if (a.isArchived === b.isArchived) return 0;
            return a.isArchived ? 1 : -1;
        });

        setConvosData(sorted);
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

    useEffect(() => {
        return tokenStore.subscribe(() => {
            const t = tokenStore.get();
            setUserId(getJwtClaim(t ?? "", "sub") ?? getJwtClaim(t ?? "", "nameid"));
        });
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function connect() {
        if (!selectedConvo) return;

        stopStreamRef.current?.();
        stopStreamRef.current = null;

        try {
            const list = await api.listMessages({ conversationId: selectedConvo, page: 1, pageSize: 100 });
            if (cancelled) return;

            const items = list.getItemsList().map((m) => ({ id: m.getMessageId(), from: m.getSenderId(), text: m.getText(), ts: m.getCreatedAt(), }));
            setMessages(items);

            const since = items.length ? items[items.length - 1].ts : undefined;

            stopStreamRef.current = api.subscribeMessages({
            conversationId: selectedConvo,
            sinceIso: since,
            onData: (m) => {
                const next = {
                    id: m.getMessageId(),
                    from: m.getSenderId(),
                    text: m.getText(),
                    ts: m.getCreatedAt(),
                };

                setMessages((curr) => {
                    const idx = curr.findIndex(
                        (x) => x.optimistic && x.from === next.from && x.text === next.text
                    );
                    if (idx !== -1) {
                    const copy = curr.slice();
                    copy[idx] = next;
                    return copy;
                    }
                    return [...curr, next];
                });
            },
            onError: (e) => {
                if (e?.code === 16) {
                setTimeout(() => {
                    if (!cancelled) {
                    const lastTs = (prev => prev[prev.length - 1]?.ts)(messages);
                    stopStreamRef.current = api.subscribeMessages({
                        conversationId: selectedConvo,
                        sinceIso: lastTs,
                        onData: (m) => {
                        const next = {
                            id: m.getMessageId(),
                            from: m.getSenderId(),
                            text: m.getText(),
                            ts: m.getCreatedAt(),
                        };
                        setMessages((curr) => [...curr, next]);
                        },
                        onError: (err) => showToast(null, "error"),
                    });
                    }
                }, 800);
                } 
                else {
                    showToast(null, "error");
                }
            },
            });
        } catch (err) {
            showToast("Nie udało się wczytać wiadomości", "error");
        } finally {
            if (!cancelled) setSelectedConvoLoading(false);
        }
        }

        setSelectedConvoLoading(Boolean(selectedConvo));
        connect();

        return () => {
            cancelled = true;
            stopStreamRef.current?.();
            stopStreamRef.current = null;
        };
    }, [selectedConvo, api]);

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
                                            <ChatPreview data={conv} key={conv.conversationId} onSelect={selectChat} archive={conv.isArchived} selected={selectedConvo === conv.conversationId ? true : false} />
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
                                    <div className="w-full h-18 bg-primary flex flex-row justify-between items-center px-3">
                                        <p className="font-marker tracking-widest text-xl text-accent">{selectedConvoData.corespondentName}</p>
                                        <div className="flex flex-row items-center gap-3">
                                            {(!selectedConvoData.taskData.applicationStatus && selectedConvoData.taskData.status === "Open" && !selectedConvoData.isArchived) && (
                                                <>
                                                    <button onClick={() => changeStatus("Reject")} className="btn btn-error">odrzuć</button>
                                                    <button onClick={() => changeStatus("Accept")} className="btn btn-success px-12">zaakceptuj</button>
                                                </>
                                            )}
                                            {(!selectedConvoData.taskData.applicationStatus && selectedConvoData.taskData.status === "Closed" && !selectedConvoData.isArchived) && (
                                                <>
                                                    <button onClick={() => markTaskAsCompleted()} className="btn btn-success px-12 tracking-wide">oznacz jako wykonane</button>
                                                </>
                                            )}
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#DDA853" className="size-7 cursor-pointer">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-full h-214 overflow-y-scroll overflow-x-hidden flex flex-col bg-whitesmoke mb-2">
                                        {(selectedConvoData.taskData?.applicationStatus && selectedConvoData.taskData?.status !== "Completed") && (
                                            <div className={`w-full py-2 flex items-center justify-center ${selectedConvoData.taskData.applicationStatus.status === 'Accepted' ? 'bg-green-300' : selectedConvoData.taskData.applicationStatus.status === 'Rejected' ? 'bg-red-300' : 'bg-accent' }`}>
                                                <p className="tracking-wide text-sm">{ApplicationStatus.find(a => a.val === selectedConvoData.taskData.applicationStatus.status).companyHint}</p>
                                            </div>
                                        )}
                                        {(selectedConvoData.taskData?.applicationStatus?.status === "Accepted" && selectedConvoData.taskData.status === "Completed") && (
                                            <div className={`w-full py-2 flex items-center justify-center bg-green-300`}>
                                                <p className="tracking-wide text-sm">Wykonane? Popros uzytkownika o opinie :)</p>
                                            </div>
                                        )}
                                        {(!selectedConvoData.taskData.applicationStatus && selectedConvoData.taskData.status === "Completed" && !selectedConvoData.isArchived) && (
                                            <div className={`w-full py-2 flex items-center justify-center bg-green-300`}>
                                                <p className="tracking-wide text-sm">Zlecenie wykonane! Wystaw opinie firmie!</p>
                                            </div>
                                        )}
                                        <div className="w-full p-6">
                                            <div className="w-full min-h-24 bg-base-100 rounded-xl gap-3 p-3 flex flex-col items-center justify-center">
                                                <p className="font-marker tracking-widest">{selectedConvoData.taskData.name}</p>
                                                <p className="text-sm text-center">{selectedConvoData.taskData.desc}</p>
                                            </div>
                                        </div>
                                        {messages.map((msg, i) => {
                                            const own = msg.from === userId;
                                            const prev = i > 0 ? messages[i - 1] : null;
                                            const sameSender = prev && prev.from === msg.from;

                                            return (
                                                <p key={msg.id} className={`px-3 py-2 rounded-xl mx-3 max-w-xs wrap-break-word ${
                                                    own ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start" } ${sameSender ? "mt-1" : "mt-3"}`}>
                                                    {msg.text}
                                                </p>
                                            );
                                        })}
                                    </div>
                                    <div className="w-full h-24 bg-primary rounded-t-3xl flex flex-row items-center px-3 gap-3">
                                        {selectedConvoData.isArchived ? (
                                            <>
                                                <div className="w-full flex items-center justify-center">
                                                   <p className="text-accent font-marker tracking-widest">Nie mozesz odpowiedziec na ta zarchiwizowana konwersacje.</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} className="w-full input bg-whitesmoke rounded-full" />
                                                <div onClick={() => send()} className="btn btn-accent w-12 h-12 rounded-full p-0! flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                                    </svg>
                                                </div>
                                            </>
                                        )}
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