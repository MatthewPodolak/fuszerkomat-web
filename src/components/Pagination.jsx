export default function Pagination({ pagination, onPageChange, showWhenSingle = false }) {
  if (!pagination) return null;

  const current = pagination.currentPage;
  const total = pagination.pageCount;
  const hasPrev = pagination.hasPrevious;
  const hasNext = pagination.hasNext;

  if (!total || (!showWhenSingle && total <= 1)) return null;

  const pages = computePages(current, total, { edges: 1, around: 1 });

  return (
    <div className="w-full flex items-center justify-center mt-6">
      <div className="join gap-0.5">
        <button type="button" className="join-item btn btn-primary" disabled={!hasPrev} onClick={() => onPageChange(current - 1)} aria-label="Previous page" >
          «
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <button key={`ellipsis-${i}`} className="join-item btn btn-primary" tabIndex={-1}>
              …
            </button>
          ) : (
            <button
              type="button"
              key={p}
              className={`join-item btn ${p === current ? "btn-accent" : "btn-primary"}`}
              onClick={() => onPageChange(p)}
              aria-current={p === current ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        <button type="button" className="join-item btn btn-primary" disabled={!hasNext} onClick={() => onPageChange(current + 1)} aria-label="Next page">
          »
        </button>
      </div>
    </div>
  );
}

function computePages(current, total, { edges = 1, around = 1 } = {}) {
  const items = [];
  const addRange = (a, b) => { for (let i = a; i <= b; i++) items.push(i); };

  const left = Math.max(1, current - around);
  const right = Math.min(total, current + around);

  addRange(1, Math.min(edges, total));
  if (left > edges + 1) items.push("…");
  addRange(Math.max(edges + 1, left), Math.min(right, total - edges));
  if (right < total - edges) items.push("…");
  if (total > edges) addRange(Math.max(total - edges + 1, edges + 1), total);

  const seen = new Set();
  return items.filter((x) => (x === "…" ? true : !seen.has(x) && seen.add(x)));
}