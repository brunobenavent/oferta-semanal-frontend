import { LayoutGrid, List } from 'lucide-react';

export default function ViewToggle({ view, onChange }) {
  return (
    <div className="view-mode-toggle">
      <button
        className={'view-mode-btn ' + (view === 'grid' ? 'active' : '')}
        onClick={() => onChange('grid')}
        title="Vista de cuadrícula"
      >
        <LayoutGrid size={18} />
      </button>
      <button
        className={'view-mode-btn ' + (view === 'list' ? 'active' : '')}
        onClick={() => onChange('list')}
        title="Vista de lista"
      >
        <List size={18} />
      </button>
    </div>
  );
}
