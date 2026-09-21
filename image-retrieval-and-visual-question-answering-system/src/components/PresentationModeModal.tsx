import React from "react";
import { Sparkles, X, Layers, Cpu, Brain, CheckCircle, HelpCircle } from "lucide-react";

interface PresentationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationModeModal: React.FC<PresentationModeModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div
        id="modal-presentation-mode"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                College Presentation & Viva Guide
              </h3>
              <p className="text-xs text-slate-400">
                Architecture Explanation & Faculty Defense Points
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          {/* Simple Academic Architecture Panel */}
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Experiment Architecture (Simple Terms)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  1. Input:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Images + natural-language query
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  2. Processing:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Multimodal retrieval identifies relevant images.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  3. Reasoning:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Gemini analyzes the retrieved image and question.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  4. Output:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Natural-language answer grounded in visual pixels.
                </span>
              </div>
            </div>
          </div>

          {/* What to Demonstrate to Faculty */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recommended Faculty Demonstration Flow
            </h4>

            <div className="space-y-2">
              <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white text-xs block">
                    Show the Candidate Dataset:
                  </strong>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Click "Load Sample Dataset" or upload 4-6 varied images (e.g. car, dog outdoors, laptop, food). Point out that all thumbnails are dynamically registered with filenames, numbers, and file sizes.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white text-xs block">
                    Demonstrate Semantic Retrieval:
                  </strong>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Enter a query like <em>"Find an image containing a red car near a building"</em>. Highlight how Gemini returns the Top 3 ranked candidates with true semantic similarity scores and factual visual justifications.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white text-xs block">
                    Transition to Visual Question Answering (VQA):
                  </strong>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Click "Select for Visual QA", then ask <em>"What color is the car and what objects are visible in the background?"</em>. Show the grounded answer, confidence level, and detected entities.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white text-xs block">
                    Run the End-to-End Automated Pipeline:
                  </strong>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Click "Run Multimodal Pipeline" in the top bar to run all 6 steps continuously, demonstrating automated query reception, candidate retrieval, target selection, and final visual result synthesis.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Viva Q&A Cheat Sheet */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Common Viva / Oral Defense Questions
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <strong className="text-slate-900 dark:text-white block mb-1">
                  Q: Why is multimodal retrieval superior to traditional keyword metadata search?
                </strong>
                <p className="text-slate-600 dark:text-slate-400">
                  Traditional search requires manual tag annotations. Multimodal models project visual feature maps and natural-language text into a shared semantic latent space, enabling zero-shot retrieval even for complex descriptive queries (e.g. "red car parked next to a glass office building").
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <strong className="text-slate-900 dark:text-white block mb-1">
                  Q: How is security preserved regarding the Gemini API Key?
                </strong>
                <p className="text-slate-600 dark:text-slate-400">
                  The API key is strictly maintained in server-side environment variables (`process.env.GEMINI_API_KEY`) on Express (`server.ts`). The client never accesses or bundles API keys, querying secure server endpoints (`/api/gemini/retrieve` and `/api/gemini/vqa`).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
