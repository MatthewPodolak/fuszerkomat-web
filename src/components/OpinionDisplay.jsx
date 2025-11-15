import PfpDisplay from "@/components/dashboard/PfpDisplay";
import Categories from "@/data/Categories.json";

export default function OpinionDisplay({ data }) {
    const baseUrl = import.meta.env.VITE_API_ORIGIN;
    const category = Categories.find(a => a.category === data.category);

    if (!data) return null;

    return (
        <div className="w-full border border-gray-400 min-h-24 flex flex-col rounded-2xl p-6 items-center relative shadow-md">
            <div className="rating rating-half rating-md mb-1">
                {Array.from({ length: 10 }).map((_, i) => {
                    const rating = data.rating;
                    const halfSteps = Math.round(rating * 2);

                    const base = "mask mask-star-2";
                    const halfClass = i % 2 === 0 ? "mask-half-1" : "mask-half-2";
                    const filled = i < halfSteps;
                    const colorClass = filled ? "bg-accent" : "bg-primary opacity-30";

                    const checked = i + 1 === halfSteps;

                    return (
                        <input key={i} type="radio" className={`${base} ${halfClass} ${colorClass}`} readOnly checked={checked} />
                    );
                })}
            </div>

            <p className="font-marker text-xs sm:text-sm tracking-widest mb-4">( {data?.rating} / 5 )</p>

            {data.comment && (
                <div className="w-full flex flex-col items-center justify-center mb-4">
                    <p className="tracking-wide text-sm sm:text-base text-center">
                        {data.comment}
                    </p>
                </div>
            )}

            <div className="w-full border-t border-gray-400 mt-4 pt-4 flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-3">
                    <PfpDisplay size="small" source={`${baseUrl}${data.creatorPfp}`} type="User"/>
                    <p className="font-marker tracking-widest text-sm sm:text-base">{data.creatorName}</p>
                </div>
                <p className="font-marker tracking-widest text-xs sm:text-sm opacity-70">{new Date(data.createdAt).toISOString().slice(0,10).replace(/-/g, ' - ')}</p>
            </div>

            <div className="rounded-full px-3 py-1 text-xs sm:text-sm text-white absolute top-4 right-4 shadow-sm" style={{ backgroundColor: category.color }}>
                {category.name}
            </div>
        </div>
    );
}