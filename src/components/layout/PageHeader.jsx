import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, backTo, actions }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
      {backTo !== undefined && (
        <button
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="p-1 -ml-1 rounded-full text-gray-500 hover:bg-gray-100"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
      )}
      <h1 className="flex-1 text-lg font-semibold text-gray-900 truncate">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
