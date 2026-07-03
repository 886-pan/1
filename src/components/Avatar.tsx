interface AvatarProps {
  src: string;
  alt: string;
}

export default function Avatar({ src, alt }: AvatarProps) {
  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-full blur-lg opacity-50 group-hover:opacity-70 transition-opacity animate-pulse-slow" />

      {/* Avatar container */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 group-hover:border-white/40 transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Decorative ring */}
      <div className="absolute -inset-2 rounded-full border-2 border-dashed border-primary-400/30 animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity" style={{ animationDuration: '20s' }} />
    </div>
  );
}