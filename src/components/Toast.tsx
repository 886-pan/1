import { useStore } from '@/store/useStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast, hideToast } = useStore();

  if (!toast.visible) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-primary-400" />,
  };

  const bgColors = {
    success: 'bg-emerald-500/20 border-emerald-500/30',
    error: 'bg-red-500/20 border-red-500/30',
    info: 'bg-primary-500/20 border-primary-500/30',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slideIn">
      <div className={`glass rounded-lg px-4 py-3 flex items-center gap-3 ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <span className="text-white/90 font-medium text-sm">{toast.message}</span>
        <button
          onClick={hideToast}
          className="ml-2 text-white/60 hover:text-white/90 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}