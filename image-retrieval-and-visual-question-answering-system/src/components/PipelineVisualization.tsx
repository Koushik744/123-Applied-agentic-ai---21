import React from "react";
import {
  UploadCloud,
  Cpu,
  SearchCheck,
  Award,
  Eye,
  CheckCircle2,
  ChevronRight,
  ArrowDown,
} from "lucide-react";

interface PipelineVisualizationProps {
  currentStage?: number; // 1 to 6 (or 0 if idle)
  isProcessing?: boolean;
}

export const PipelineVisualization: React.FC<PipelineVisualizationProps> = ({
  currentStage = 0,
  isProcessing = false,
}) => {
  const steps = [
    {
      id: 1,
      title: "Upload Images",
      subtitle: "JPG, PNG, WEBP candidates",
      icon: UploadCloud,
    },
    {
      id: 2,
      title: "Image Processing",
      subtitle: "Base64 & visual tokens",
      icon: Cpu,
    },
    {
      id: 3,
      title: "Multimodal Retrieval",
      subtitle: "Cross-attention & semantics",
      icon: SearchCheck,
    },
    {
      id: 4,
      title: "Top Relevant Images",
      subtitle: "Ranked candidates (Top 3)",
      icon: Award,
    },
    {
      id: 5,
      title: "Gemini Vision / VQA",
      subtitle: "Visual reasoning on selected",
      icon: Eye,
    },
    {
      id: 6,
      title: "Final Answer",
      subtitle: "Grounded multimodal result",
      icon: CheckCircle2,
    },
  ];

  return (
    <section
      id="multimodal-pipeline-visualization"
      className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm text-slate-100"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-indigo-400">
            Multimodal Architecture Pipeline
          </h2>
          <p className="text-xs text-slate-400">
            End-to-end multimodal flow: User Query → Semantic Retrieval → Visual Question Answering
          </p>
        </div>
        {isProcessing && (
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span>Pipeline Executing: Stage {currentStage} of 6</span>
          </div>
        )}
      </div>

      {/* Desktop / Tablet Flow (Horizontal Grid) */}
      <div className="hidden md:grid md:grid-cols-6 gap-2 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStage === step.id;
          const isCompleted = currentStage > step.id;

          let cardStyle = "bg-slate-800/60 border-slate-700/70 text-slate-300";
          let badgeStyle = "bg-slate-700 text-slate-300";

          if (isActive) {
            cardStyle =
              "bg-indigo-950/80 border-indigo-500 text-white ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10";
            badgeStyle = "bg-indigo-600 text-white animate-bounce";
          } else if (isCompleted) {
            cardStyle = "bg-slate-800/90 border-emerald-500/50 text-emerald-100";
            badgeStyle = "bg-emerald-600 text-white";
          }

          return (
            <div key={step.id} className="relative group">
              <div
                className={`flex flex-col h-full rounded-lg border p-3 transition-all duration-200 ${cardStyle}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${badgeStyle}`}>
                    {step.id}
                  </div>
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-indigo-400"
                        : isCompleted
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }`}
                  />
                </div>
                <h3 className="text-xs font-semibold text-white leading-snug">
                  {step.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {step.subtitle}
                </p>
              </div>

              {/* Connecting arrow */}
              {idx < steps.length - 1 && (
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 z-10 hidden md:block pointer-events-none">
                  <ChevronRight
                    className={`w-4 h-4 ${
                      isCompleted ? "text-emerald-400" : "text-slate-600"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Flow (Vertical List) */}
      <div className="md:hidden space-y-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStage === step.id;
          const isCompleted = currentStage > step.id;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center space-x-3 p-2.5 rounded-lg border text-xs ${
                  isActive
                    ? "bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-500"
                    : isCompleted
                    ? "bg-slate-800/80 border-emerald-500/40 text-slate-200"
                    : "bg-slate-800/50 border-slate-700/60 text-slate-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {step.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-100">{step.title}</div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {step.subtitle}
                  </div>
                </div>
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? "text-indigo-400"
                      : isCompleted
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
                />
              </div>

              {idx < steps.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};
