import React, { useState } from "react";
import {
  PlayCircle,
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileCheck,
  Search,
  Eye,
} from "lucide-react";
import { UploadedImage, PipelineStep } from "../types";

interface EndToEndRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: UploadedImage[];
  onRunPipeline: (
    query: string,
    question: string,
    onStepUpdate: (steps: PipelineStep[]) => void
  ) => Promise<void>;
  isExecuting: boolean;
}

const PRESET_SCENARIOS = [
  {
    title: "Scenario A: Red Car Identification",
    query: "Find an image containing a red car",
    question: "What color is the car, and what is in the background?",
  },
  {
    title: "Scenario B: Person Working with Laptop",
    query: "Find an image containing a person using a laptop",
    question: "What is the person doing and what drinks or items are on the desk?",
  },
  {
    title: "Scenario C: Dog in Nature",
    query: "Find a dog outdoors",
    question: "What breed characteristics or colors does the dog have, and what is its environment?",
  },
  {
    title: "Scenario D: Italian Food Analysis",
    query: "Find images of food",
    question: "What dish is shown on the plate and what garnish or toppings are visible?",
  },
];

export const EndToEndRunnerModal: React.FC<EndToEndRunnerModalProps> = ({
  isOpen,
  onClose,
  images,
  onRunPipeline,
  isExecuting,
}) => {
  const [query, setQuery] = useState(PRESET_SCENARIOS[0].query);
  const [question, setQuestion] = useState(PRESET_SCENARIOS[0].question);
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: 1, title: "STEP 1", subtitle: "Query received", status: "idle" },
    { id: 2, title: "STEP 2", subtitle: "Searching uploaded images", status: "idle" },
    { id: 3, title: "STEP 3", subtitle: "Relevant image retrieved", status: "idle" },
    { id: 4, title: "STEP 4", subtitle: "Sending image + question to Gemini", status: "idle" },
    { id: 5, title: "STEP 5", subtitle: "Generating visual answer", status: "idle" },
    { id: 6, title: "STEP 6", subtitle: "Final result", status: "idle" },
  ]);

  if (!isOpen) return null;

  const handleSelectScenario = (idx: number) => {
    setActiveScenarioIdx(idx);
    setQuery(PRESET_SCENARIOS[idx].query);
    setQuestion(PRESET_SCENARIOS[idx].question);
    setErrorMsg(null);
  };

  const handleExecute = async () => {
    if (images.length === 0) {
      setErrorMsg("No images uploaded. Please upload candidate images or load the sample dataset first.");
      return;
    }
    if (!query.trim()) {
      setErrorMsg("Please enter a retrieval query.");
      return;
    }
    if (!question.trim()) {
      setErrorMsg("Please enter a VQA question.");
      return;
    }

    setErrorMsg(null);
    await onRunPipeline(query.trim(), question.trim(), (updated) => {
      setSteps([...updated]);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div
        id="modal-end-to-end-pipeline"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                End-to-End Multimodal Pipeline Demonstration
              </h3>
              <p className="text-xs text-slate-400">
                Automated 6-step sequential pipeline: Retrieval → Target Selection → Visual Q&A
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExecuting}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Scenario Picker */}
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Select Preset Demonstration Scenario:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.title}
                  type="button"
                  onClick={() => handleSelectScenario(idx)}
                  disabled={isExecuting}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    activeScenarioIdx === idx
                      ? "border-indigo-600 dark:border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="font-semibold">{sc.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Query: "{sc.query}"
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Query and Question Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-indigo-500" />
                <span>1. Retrieval Query</span>
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isExecuting}
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="e.g. Find an image containing a red car"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                <span>2. Downstream Question</span>
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isExecuting}
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="e.g. What color is the car?"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 6 Step Stepper Diagram */}
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Execution Timeline (Steps 1 – 6):
            </span>

            <div className="space-y-2">
              {steps.map((step) => {
                let badgeClass = "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
                let containerClass = "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30";

                if (step.status === "running") {
                  badgeClass = "bg-indigo-600 text-white animate-pulse";
                  containerClass = "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 ring-1 ring-indigo-500";
                } else if (step.status === "completed") {
                  badgeClass = "bg-emerald-600 text-white";
                  containerClass = "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100";
                } else if (step.status === "failed") {
                  badgeClass = "bg-rose-600 text-white";
                  containerClass = "border-rose-500 bg-rose-50/30 dark:bg-rose-950/30";
                }

                return (
                  <div
                    key={step.id}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all ${containerClass}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                        {step.title}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {step.subtitle}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {step.detail && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          {step.detail}
                        </span>
                      )}

                      {step.status === "running" && (
                        <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                      )}
                      {step.status === "completed" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {step.status === "idle" && (
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {images.length} candidate image{images.length === 1 ? "" : "s"} ready in memory
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isExecuting}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              id="btn-execute-end-to-end"
              onClick={handleExecute}
              disabled={isExecuting || images.length === 0}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow transition-colors cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execute Full Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
