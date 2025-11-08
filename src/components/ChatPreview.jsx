import PfpDisplay from "@/components/dashboard/PfpDisplay";

export default function ChatPreview({data, selected = false, onSelect}){
    if(!data){ return null }

    const baseUrl = import.meta.env.VITE_API_ORIGIN;
    const pfp = `${baseUrl}${data.corespondentImg}`;

    
    return (
        <div onClick={() => onSelect(data.conversationId)} className={`w-full h-24 flex flex-row items-center px-2 gap-2 hover:shadow-md cursor-pointer ${selected ? `shadow-[0_15px_40px_-10px_rgba(0,0,0,0.25),0_-15px_40px_-10px_rgba(0,0,0,0.25)]` : ''}`}>
            <PfpDisplay source={pfp} size="ml" />
            <div className="flex flex-col ml-2 w-3/4 overflow-hidden">
                <p className="font-semibold text-lg tracking-wider">{data.corespondentName}</p>
                <p className="truncate text-md text-gray-700">{data.lastMsg?.msg}</p>
            </div>
        </div>
    );
}