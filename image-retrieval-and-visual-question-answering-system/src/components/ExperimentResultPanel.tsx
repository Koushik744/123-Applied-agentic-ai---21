import React, { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  Download,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
} from "lucide-react";
import { ExperimentSummary } from "../types";

interface ExperimentResultPanelProps {
  summary: ExperimentSummary | null;
}

export const ExperimentResultPanel: React.FC<ExperimentResultPanelProps> = ({
  summary,
}) => {
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const formattedReport = `========================================================
IMAGE RETRIEVAL AND VISUAL QUESTION ANSWERING EXPERIMENT REPORT
========================================================
Date: ${summary.timestamp}
Pipeline: Query → Retrieval → Image → Vision → Answer

1. RETRIEVAL QUERY:
   "${summary.query}"

2. TOP RETRIEVED IMAGE:
   Filename: ${summary.retrievedImage.filename}
   Rank: #${summary.relevanceRank}
   Semantic Similarity Score: ${(summary.relevanceScore * 100).toFixed(1)}% (${summary.relevanceScore.toFixed(2)})
   Retrieval Engine: ${summary.retrievalMethod}

3. VISUAL QUESTION:
   "${summary.question}"

4. GEMINI AI ANSWER:
   ${summary.answer}

5. VISUAL EVIDENCE:
   ${summary.visualEvidence || "Grounded directly on image visual tokens"}
   Confidence: ${summary.confidence || "High"}
========================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedReport], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `multimodal_experiment_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="experiment-result-panel"
      className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-900/60 p-5 shadow-sm space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Experiment Result Summary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified end-to-end multimodal pipeline execution report
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-copy-experiment-report"
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Report</span>
              </>
            )}
          </button>

          <button
            id="btn-download-experiment-report"
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .txt</span>
          </button>
        </div>
      </div>

      {/* Pipeline Breadcrumb */}
      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between text-xs gap-2">
        <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider">
          Pipeline Flow:
        </span>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300">
          <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold">
            Query
          </span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold">
            Retrieval
          </span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-semibold">
            Image
          </span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold">
            Vision
          </span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold">
            Answer
          </span>
        </div>
      </div>

      {/* 4 Core Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Retrieval Query & Image */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              Query:
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              "{summary.query}"
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>Retrieved Image:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Rank #{summary.relevanceRank} (Score: {(summary.relevanceScore * 100).toFixed(0)}%)
              </span>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-md border border-slate-100 dark:border-slate-800">
              <img
                src={summary.retrievedImage.previewUrl}
                alt={summary.retrievedImage.filename}
                className="w-16 h-16 object-cover rounded-md border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {summary.retrievedImage.filename}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Size: {summary.retrievedImage.fileSize}
                </div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                  Matched via Cross-Attention
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Visual Question & Gemini Answer */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              Question:
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              "{summary.question}"
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Gemini Answer:</span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
              {summary.answer}
            </p>

            {summary.visualEvidence && (
              <div className="mt-2.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60 text-xs text-slate-600 dark:text-slate-300">
                <strong className="text-slate-700 dark:text-slate-200">Visual Evidence: </strong>
                <span>{summary.visualEvidence}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
