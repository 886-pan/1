import { Github, Linkedin, Twitter, Globe, ExternalLink } from 'lucide-react';

interface SocialLinkButtonProps {
  platform: string;
  url: string;
  icon: string;
  index: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  globe: Globe,
};

export default function SocialLinkButton({ platform, url, icon, index }: SocialLinkButtonProps) {
  const IconComponent = iconMap[icon] || Globe;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative w-12 h-12 rounded-full glass flex items-center justify-center
        transform transition-all duration-300 hover:scale-110 hover:rotate-6
        hover:shadow-lg hover:shadow-primary-500/30 animate-fadeIn`}
      style={{ animationDelay: `${index * 80}ms` }}
      title={platform}
    >
      <IconComponent className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />

      {/* Hover background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />

      {/* External link indicator */}
      <ExternalLink className="absolute -top-1 -right-1 w-3 h-3 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}