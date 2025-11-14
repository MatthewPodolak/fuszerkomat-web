import Categories from "@/data/Categories.json";
import ApplicationStatus from "@/data/ApplicationStatus.json";

export default function AppliedTaskPreview({data}){
    const location = data.location?.trim() || "Polska";

    const category = Categories.find(a=>a.category === data.category);
    const allTags = Categories.flatMap((cat) => cat.tags.map((tag) => ({ ...tag })));
    const tags = allTags.filter(tag => data.tags.includes(tag.name));
    
    return (
        <div className="w-full bg-whitesmoke border border-primary px-6 py-3 rounded-xl cursor-pointer hover:shadow-2xl">
            <div className="w-full flex flex-col">
                <div className="w-full flex flex-row justify-between items-center">
                    <p className="text-xl font-marker tracking-widest">{data.name}</p>
                        {data.status && (() => {
                            const apk = ApplicationStatus.find(a => a.val === data.status);
                            return (
                                <div className="rounded-full px-3 py-1 text-sm text-white" style={{ backgroundColor: apk.color }}>
                                    {apk.normalized}
                                </div>
                            );
                        })()}
                </div>
                <p className="tracking-widest text-md ml-1">{data.desc}</p>
                <div className="w-full flex flex-row items-center justify-between mt-3 mb-3">
                    <div className="w-full flex flex-row items-center gap-2">
                        <div className="rounded-full px-3 py-1 text-sm text-white" style={{ backgroundColor: category.color }}>{category.name} </div>
                        {tags?.map((tag) => (
                            <div key={tag.name} className="rounded-full px-3 py-1 text-sm border">{tag.name}</div>
                        ))}
                    </div>
                    {data.maxPrice !== 0 && (
                        <p className="whitespace-nowrap font-marker text-sm tracking-widest">MAX <span className="text-xl text-primary">{data.maxPrice}</span> zł</p>
                    )}
                </div>
            </div>
            <div className="w-full flex flex-row border-t border-primary items-center justify-between py-3">
                <div className="flex flex-row items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <p className="text-sm tracking-wider ml-1">{location}</p>
                </div>               
            </div>
        </div>
    );
}