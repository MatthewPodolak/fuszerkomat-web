import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

import Questionary from "@/components/Questionary";
import categories from "../data/Categories.json";

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);
  const allTags = categories.flatMap((cat) => cat.tags.map((tag) => ({ ...tag, category: cat.name, cat: cat.category })));

  const [isQuestOpen, setIsQuestOpen] = useState(false);
  const [preQuest, setPreQuest] = useState(null);

  const search = (e) => {
    const value = e.target.value.toLowerCase();
    setQuery(value);

    if (!value.trim()) { setSuggestions([]); return; }

    const normalize = (s="") => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matchedTags = allTags.filter(tag => {
      const q = normalize(value);
      const nameHit = normalize(tag.name).includes(q);
      const kwHit = (tag.keywords || []).some(k => normalize(k).includes(q));
      return nameHit || kwHit;
    }).slice(0, 8);

    const matchedCategories = categories.filter((cat) => cat.name.toLowerCase().includes(value)).map((cat) => ({ name: cat.name, cat: cat.category }));
    let matched = [...matchedCategories, ...matchedTags].slice(0, 8);

    if(value && matched.length === 0){ matched = [{ name: "Inne" }]; }

    setSuggestions(matched);
  };

  const searchFor = (v) => {
    setSuggestions([]);

    let picked = { tag: null, cat: "Other" };
    if(v){ 
      picked.tag = v?.tagName ?? null;
      picked.cat = v?.cat ?? null;
    }

    setPreQuest(picked);
    setIsQuestOpen(true);
  };

  const closeQuest = () => { setIsQuestOpen(false); };

  useEffect(() => {
      const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
          setSuggestions([]);
        }
      };
      const handleEsc = (e) => {
        if (e.key === "Escape") setSuggestions([]);
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleEsc);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
        document.removeEventListener("keydown", handleEsc);
      };
    }, []);

  return (
    <>
    <div className="w-full min-h-screen bg-whitesmoke flex items-center justify-center">
      <div className="w-full max-w-7xl px-6">

        <section className="min-h-[55vh] flex flex-col items-center justify-center text-center gap-6">
          <h1 className="font-marker tracking-[0.05em] text-5xl sm:text-6xl md:text-7xl">
            Znajdz fachure do swojego projektu : )
          </h1>
          <p className="text-base sm:text-lg text-base-content/70 max-w-2xl">
            Szukasz kogoś, kto pomaluje, wyremontuje, naprawi lub poskłada meble i nie zniknie po pierwszym dniu?
            Na FUSZERKOMAT wrzucasz zadanie, a my łączymy Cię z fachowcami, którzy naprawdę ogarniają robotę.
            Szybko, lokalnie i bez zbędnego gadania.
          </p>

          <div ref={wrapperRef} className="w-full max-w-2xl relative" >
            <div className="join w-full">
              <input onInput={search} value={query} name="q" type="text" placeholder="Czego potrzebujesz?" className="input h-12 input-bordered join-item w-full bg-whitesmoke" />
              <button onClick={() => searchFor()} className="btn btn-primary join-item h-12">
                Szukaj
              </button>
            </div>
            {suggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 rounded-lg bg-whitesmoke shadow-lg z-10 text-left p-2 overflow-y-auto">
                {suggestions.map((item, i) => (
                  <div onClick={() => searchFor(item)} key={`${item.tagName || item.name}-${i}`} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <p className="text-md">{item.name}</p>
                    {item.category && (
                      <p className="text-sm text-gray-500">{item.category}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2 mb-12">
          {categories.map(({ category, name, tags }) => {
            const count = tags?.length ?? 0;
            return (
              <Link key={category} to={`/category/${category}`} className="card bg-base-100 hover:shadow-lg transition cursor-pointer">
                <div className="card-body">
                  <h3 className="card-title text-base">{name}</h3>
                  <p className="text-sm text-base-content/70">
                    {count} podkategor{count === 1 ? "ia" : count < 5 ? "ie" : "ii"}
                  </p>
                  <div className="card-actions justify-end">
                    <span className="">Zobacz</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
    <Questionary open={isQuestOpen} onClose={closeQuest} pre={preQuest} />
    </>
  );
}