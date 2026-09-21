import React from "react";
import { Sparkles, BookOpen, Layers, PlayCircle, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onOpenAbout: () => void;
  onOpenPresentation: () => void;
  onRunEndToEnd: () => void;
  isProcessing: boolean;
  totalImages: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAbout,
  onOpenPresentation,
  onRunEndToEnd,
  isProcessing,
  totalImages,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Title & Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-inner text-white font-bold text-lg">
              <Layers className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  IMAGE RETRIEVAL + VISUAL QA
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  College Lab Experiment
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Multimodal AI Pipeline using Gemini
              </p>
            </div>
          </div>

          {/* Action Buttons & Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Server-Side Gemini 3.8</span>
            </div>

            <button
              id="btn-run-multimodal-pipeline"
              type="button"
              onClick={onRunEndToEnd}
              disabled={isProcessing || totalImages === 0}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium text-white shadow transition-colors"
              title="Run complete 6-step multimodal pipeline"
            >
              <PlayCircle className="w-4 h-4 text-indigo-200" />
              <span>Run Multimodal Pipeline</span>
            </button>

            <button
              id="btn-presentation-mode"
              type="button"
              onClick={onOpenPresentation}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-xs sm:text-sm font-medium text-slate-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Presentation Mode</span>
              <span className="sm:hidden">Explain</span>
            </button>

            <button
              id="btn-about-experiment"
              type="button"
              onClick={onOpenAbout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-xs sm:text-sm font-medium text-slate-200 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>About Experiment</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
