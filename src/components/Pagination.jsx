import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
  const { page, pages, total } = pagination;
  if (pages <= 1) {
    return (
      <div className="pagination-bar">
        <span className="pagination-info">{total} resultados</span>
      </div>
    );
  }

  const startItem = total > 0 ? (page - 1) * 100 + 1 : 0;
  const endItem = Math.min(page * 100, total);

  const getPages = () => {
    const isMobile = window.innerWidth < 768;
    const range = isMobile ? 1 : 2;
    const pages_range = [];
    const start = Math.max(1, page - range);
    const end = Math.min(pages, page + range);
    if (start > 1) pages_range.push(1);
    if (start > 2) pages_range.push('...');
    for (let i = start; i <= end; i++) pages_range.push(i);
    if (end < pages - 1) pages_range.push('...');
    if (end < pages) pages_range.push(pages);
    return pages_range;
  };

  return (
    <div className="pagination-bar">
      <span className="pagination-info">{startItem}-{endItem} de {total}</span>
      <div className="pagination-controls">
        <button className="pagination-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={18} />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={'e' + i} style={{ padding: '0 4px', color: 'var(--color-text-muted)' }}>...</span>
          ) : (
            <button
              key={p}
              className={'pagination-btn' + (p === page ? ' active' : '')}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button className="pagination-btn" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
