import React from "react";
import { BookOpen, X, Layers, Cpu, Award, CheckCircle2, FileCode } from "lucide-react";

interface AboutExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutExperimentModal: React.FC<AboutExperimentModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div
        id="modal-about-experiment"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                About Experiment
              </h3>
              <p className="text-xs text-slate-400">
                Course Laboratory & Project Documentation
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
          {/* Title & Objective */}
          <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
              Experiment Title
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Image Retrieval / Visual Question Answering System
            </h4>
            <div className="pt-2 border-t border-sky-200/60 dark:border-sky-900/60">
              <span className="font-semibold text-slate-900 dark:text-white">Objective: </span>
              <span>
                "To develop a multimodal pipeline that combines image retrieval and visual question answering using Gemini."
              </span>
            </div>
          </div>

          {/* Core Concept Explanations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Key Academic Concepts
            </h4>

            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Image Retrieval:</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                Finding images that are semantically relevant to a natural-language query. In contrast to legacy keyword tags, multimodal retrieval examines high-dimensional visual features (objects, color palettes, contextual settings, spatial relations) to match the semantic intent of freeform queries.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span>Visual Question Answering (VQA):</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                Answering natural-language questions by understanding the content of an image. The model joins visual token embeddings with linguistic token embeddings to perform multi-step spatial and semantic reasoning over visible pixel entities.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-purple-500" />
                <span>Multimodal Pipeline:</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                A pipeline that processes both text and visual information. Rather than treating vision and text as isolated silos, the multimodal pipeline forms a coherent end-to-end flow where text retrieves visual data, and visual data grounds text answers.
              </p>
            </div>
          </div>

          {/* Pipeline Trace */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Pipeline Stage Trace
            </h5>
            <ol className="space-y-1.5 list-decimal list-inside text-xs text-slate-700 dark:text-slate-300">
              <li><strong>User Query:</strong> User submits natural-language search requirement.</li>
              <li><strong>Text Understanding:</strong> Query is tokenized and semantic intent is extracted.</li>
              <li><strong>Image Retrieval:</strong> Multimodal semantic cross-attention compares query against image collection.</li>
              <li><strong>Top Relevant Images:</strong> Candidates ranked by relevance score; top 3 presented.</li>
              <li><strong>Visual Question Answering:</strong> Selected image + user question dispatched to Gemini Vision.</li>
              <li><strong>Final Answer:</strong> Grounded natural-language answer with visual evidence returned.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
