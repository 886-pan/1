import { Mail, Phone, MapPin, Copy } from 'lucide-react';
import { useState } from 'react';

interface ContactItemProps {
  type: 'email' | 'phone' | 'location';
  value: string;
}

const icons = {
  email: Mail,
  phone: Phone,
  location: MapPin,
};

export default function ContactItem({ type, value }: ContactItemProps) {
  const [copied, setCopied] = useState(false);
  const Icon = icons[type];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg glass hover:bg-white/15 transition-all duration-300 group">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-white/80 font-source flex-1">{value}</span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-lg hover:bg-white/20"
        title="复制"
      >
        {copied ? (
          <span className="text-emerald-400 text-xs">已复制</span>
        ) : (
          <Copy className="w-4 h-4 text-white/60" />
        )}
      </button>
    </div>
  );
}