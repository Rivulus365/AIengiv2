
import React from 'react';
import { Sparkles, AlertTriangle, BookOpen, CheckCircle2 } from 'lucide-react';

interface ConfidenceChipProps {
  score?: number; // 0 to 1
  source?: string;
  className?: string;
}

const ConfidenceChip: React.FC<ConfidenceChipProps> = ({ score = 0.95, source = "D&D 5e SRD", className = "" }) => {
  let color = "text-emerald-400";
  let bg = "bg-emerald-950/30";
  let border = "border-emerald-900/50";
  let icon = CheckCircle2;
  let text = "High Confidence";

  if (score < 0.7) {
    color = "text-amber-400";
    bg = "bg-amber-950/30";
    border = "border-amber-900/50";
    icon = AlertTriangle;
    text = "Review Suggested";
  }

  const Icon = icon;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
        {/* Confidence Indicator */}
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${bg} ${border} ${color} cursor-help group relative`}>
            <Icon className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{text}</span>
            
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-[#1c1917] border border-[#292524] rounded text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10 text-center">
                AI probabilistic output. {score < 0.7 ? "May contain hallucinations." : "Output aligns with ruleset."}
            </div>
        </div>

        {/* Source Citation */}
        <div className="flex items-center gap-1.5 text-[10px] text-stone-600">
            <BookOpen className="w-3 h-3" />
            <span>Source: {source}</span>
        </div>
    </div>
  );
};

export default ConfidenceChip;
