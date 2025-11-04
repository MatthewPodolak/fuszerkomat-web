import { useState } from "react";
import LocationPicker from "@/components/LocationPicker";
import LocationSearch from "@/components/LocationSearch";

import categories from "@/data/Categories.json";
const allTags = categories.flatMap((cat) => cat.tags.map((tag) => ({ ...tag })));
const SORT_OPT = [
  { name: "Najbliższe", val: "Nearest" },
  { name: "Najmniej aplikacji", val: "LowestApplicants" },
  { name: "Cena rosnąco", val: "MaxPriceAsc" },
  { name: "Cena malejąco", val: "MaxPriceDesc" },
  { name: "Termin rosnąco", val: "DeadlineAsc" },
  { name: "Termin malejąco", val: "DeadlineDesc" },
];
const BROWSE_QR_EMPTY = {
    keyWords: null,
    sort: null,
    category: null,
    tags: [],
    location: {
        radius: 10,
        lat: null,
        long: null,
        name: null,
    }
};

export default function TaskBrowser({onSearch}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [browseQuery, setBrowseQuery] = useState(BROWSE_QR_EMPTY);

    const handleLocationSearch = ({ label, lat, lon }) => {
        setBrowseQuery(prev => ({ ...prev, location: { ...prev.location, name: label, lat: Number(lat), long: Number(lon) } }));
    };

    return (
        <div className="w-full bg-primary flex flex-col p-6">
            <div className="w-full flex flex-row justify-between items-center">
                <div className="w-full flex flex-row gap-3">
                    <label className="input bg-whitesmoke">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor" > <circle cx="11" cy="11" r="8"></circle> <path d="m21 21-4.3-4.3"></path> </g>
                        </svg>
                        <input value={browseQuery.keyWords ?? ""}  onChange={(e) => {setBrowseQuery(prev => ({ ...prev, keyWords: e.target.value })); }} type="search" required placeholder="Szukaj" />
                    </label>
                    <button onClick={() => onSearch(browseQuery)} className="btn btn-accent w-36 tracking-wider">szukaj</button>
                </div>
                {isExpanded ? (
                    <svg onClick={() => setIsExpanded(false)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#DDA853" className="size-7 cursor-pointer">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                ) : (
                    <svg onClick={() => setIsExpanded(true)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#DDA853" className="size-7 cursor-pointer">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                )}
            </div>
            {isExpanded && (
                <div className="w-full h-auto bg-primary flex flex-col mt-6">
                    <div className="w-full flex flex-row gap-3">
                        <select className="select bg-whitesmoke" onChange={(e) => setBrowseQuery(prev => ({ ...prev, category: e.target.value || null })) }>
                            <option>Kategorie</option>
                            {categories.map((cat) => (
                                <option key={cat.name} value={cat.category}>{cat.name}</option>
                            ))}
                        </select>
                        <select className="select bg-whitesmoke" onChange={(e) => setBrowseQuery(prev => ({ ...prev, tags: [e.target.value] || null })) }>
                            <option>Tagi</option>
                            {allTags.map((tag) => (
                                <option key={tag.name} value={tag.tagName}>{tag.name}</option>
                            ))}
                        </select>
                        <select className="select bg-whitesmoke" onChange={(e) => setBrowseQuery(prev => ({ ...prev, sort: e.target.value || null })) }>
                            <option>Sortuj</option>
                            {SORT_OPT.map((opt) => (
                                <option key={opt.name} value={opt.val} >{opt.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full mt-6 h-auto">
                        <div className="w-full flex flex-row gap-6 justify-between items-center">
                            <LocationSearch onPick={handleLocationSearch}/>
                            <div className="flex flex-row items-center gap-5 relative">
                                <p className="whitespace-nowrap text-accent font-marker tracking-widest">10 km</p>
                                <input value={browseQuery.location.radius}   onChange={(e) => setBrowseQuery((prev) => ({ ...prev, location: { ...prev.location, radius: Number(e.target.value), }, }))} type="range" min={10} max="500" className="range range-accent" />
                                <p className="whitespace-nowrap text-accent font-marker tracking-widest">500 km</p>
                                <p className="absolute left-1/2 -bottom-8 -translate-x-1/2 text-accent font-marker tracking-widest">+ {browseQuery.location.radius} km</p>
                            </div>
                        </div>
                        <div className="flex flex-col w-full mt-12 h-auto min-h-64">
                             <LocationPicker
                                zoom={10}
                                initial={{ lat: browseQuery?.location?.lat, lng: browseQuery?.location?.long }}
                                onPick={(lat, lng) => setBrowseQuery(prev => ({ ...prev, location: { ...prev.location, lat, long: lng } }))}
                                rangeEnabled={true}
                                range={browseQuery.location.radius}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}