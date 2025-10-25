import categories from "../data/Categories.json";

export default function Home() {
  return (
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

          <div className="w-full max-w-2xl" >
            <div className="join w-full">
              <input name="q" type="text" placeholder="Czego potrzebujesz?" className="input h-12 input-bordered join-item w-full bg-whitesmoke" />
              <button className="btn btn-primary join-item h-12">
                Szukaj
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2 mb-12">
          {categories.map(({ category, name, tags }) => {
            const count = tags?.length ?? 0;
            return (
              <a key={category} className="card bg-base-100 hover:shadow-lg transition cursor-pointer">
                <div className="card-body">
                  <h3 className="card-title text-base">{name}</h3>
                  <p className="text-sm text-base-content/70">
                    {count} podkategor{count === 1 ? "ia" : count < 5 ? "ie" : "ii"}
                  </p>
                  <div className="card-actions justify-end">
                    <span className="">Zobacz</span>
                  </div>
                </div>
              </a>
            );
          })}
        </section>
      </div>
    </div>
  );
}