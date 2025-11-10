import PfpDisplay from "@/components/dashboard/PfpDisplay";

export default function ChatPreview({data, selected = false, archive = false, onSelect}){
    if(!data){ return null }

    const baseUrl = import.meta.env.VITE_API_ORIGIN;
    const pfp = `${baseUrl}${data.corespondentImg}`;
    
    return (
        <div onClick={() => onSelect(data)} className={`w-full h-24 flex flex-row items-center px-2 gap-2 hover:shadow-md cursor-pointer ${selected ? `shadow-[0_15px_40px_-10px_rgba(0,0,0,0.25),0_-15px_40px_-10px_rgba(0,0,0,0.25)]` : ''} relative`}>
            <div className="w-16 h-16 relative items-center flex justify-center">
                <PfpDisplay source={pfp} size="ml" />
                {archive && (
                    <div className="w-full h-full bg-black/20 absolute rounded-full"></div>
                )}
            </div>
            <div className="flex flex-col ml-2 w-3/4 overflow-hidden">
                <p className={`font-semibold text-lg tracking-wider ${archive ? 'text-gray-500' : ``} `}>{data.corespondentName}</p>
                <p className={`truncate text-md text-gray-700 ${archive ? 'text-gray-500' : ``} `}>{data.lastMsg?.msg}</p>
            </div>
        </div>
    );
}