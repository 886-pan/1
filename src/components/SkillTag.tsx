interface SkillTagProps {
  skill: string;
  index: number;
}

export default function SkillTag({ skill, index }: SkillTagProps) {
  const colors = [
    'from-primary-400 to-primary-500',
    'from-secondary-400 to-secondary-500',
    'from-emerald-400 to-teal-500',
    'from-orange-400 to-pink-500',
    'from-blue-400 to-indigo-500',
    'from-cyan-400 to-blue-500',
  ];

  const colorClass = colors[index % colors.length];

  return (
    <span
      className={`px-4 py-2 rounded-full bg-gradient-to-r ${colorClass} text-white/95 text-sm font-medium
        transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-500/30
        cursor-default animate-fadeIn`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {skill}
    </span>
  );
}