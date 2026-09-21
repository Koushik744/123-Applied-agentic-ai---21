import React, { useState } from "react";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  Image as ImageIcon,
  Tag,
  ShieldAlert,
} from "lucide-react";
import { UploadedImage, VQAResponse } from "../types";

interface VisualQuestionAnsweringTabProps {
  images: UploadedImage[];
  selectedImage: UploadedImage | null;
  onSelectImage: (image: UploadedImage) => void;
  question: string;
  onQuestionChange: (q: string) => void;
  onAskQuestion: (image: UploadedImage, question: string) => void;
  vqaResult: VQAResponse | null;
  isAnswering: boolean;
  onSwitchToRetrievalTab: () => void;
}

const EXAMPLE_QUESTIONS = [
  "What objects are visible in this image?",
  "What color is the car?",
  "How many people are visible?",
  "What is the person doing?",
  "Is there a laptop in the image?",
  "Describe the scene.",
  "What text is visible in the image?",
];

export const VisualQuestionAnsweringTab: React.FC<VisualQuestionAnsweringTabProps> = ({
  images,
  selectedImage,
  onSelectImage,
  question,
  onQuestionChange,
  onAskQuestion,
  vqaResult,
  isAnswering,
  onSwitchToRetrievalTab,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      setErrorMsg("Please select an image first before asking a question.");
      return;
    }
    if (!question.trim()) {
      setErrorMsg("Please enter a question about the selected image.");
      return;
    }
    setErrorMsg(null);
    onAskQuestion(selectedImage, question.trim());
  };

  const handleChipClick = (q: string) => {
    onQuestionChange(q);
    if (selectedImage) {
      setErrorMsg(null);
      onAskQuestion(selectedImage, q);
    }
  };

  return (
    <div id="visual-question-answering-tab" className="space-y-6">
      {/* Selected Image & Candidate Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                4. Visual Question Answering (VQA)
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Gemini 3.8 Multimodal Vision
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any candidate image from your dataset or previous retrieval step, then query Gemini about its visual details.
            </p>
          </div>

          {images.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Active image:{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {selectedImage ? selectedImage.filename : "None selected"}
              </strong>
            </span>
          )}
        </div>

        {/* Selected Image Preview + Quick Gallery Picker */}
        {selectedImage ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Main Preview */}
            <div className="lg:col-span-5 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative shadow-inner">
              <img
                src={selectedImage.previewUrl}
                alt={selectedImage.filename}
                className="w-full max-h-72 object-contain mx-auto"
              />
              <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono truncate">{selectedImage.filename}</span>
                <span className="text-[11px] text-slate-400">{selectedImage.fileSize}</span>
              </div>
            </div>

            {/* Quick Switcher Thumbnails */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
                  Select target image from dataset ({images.length} available):
                </span>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                  {images.map((img, idx) => {
                    const isTarget = selectedImage.id === img.id;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => onSelectImage(img)}
                        className={`group relative w-16 h-16 rounded-lg overflow-hidden border transition-all ${
                          isTarget
                            ? "ring-2 ring-indigo-500 border-indigo-500 scale-105 shadow-md"
                            : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                        }`}
                        title={img.filename}
                      >
                        <img
                          src={img.previewUrl}
                          alt={img.filename}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] font-mono text-center truncate px-0.5">
                          #{idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                <span>
                  Tip: You can also retrieve images by query in the{" "}
                  <strong>Image Retrieval</strong> tab and click "Select for Visual QA".
                </span>
                <button
                  type="button"
                  onClick={onSwitchToRetrievalTab}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2"
                >
                  Go to Search →
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
            <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No image currently selected for VQA.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please upload images above or load the sample dataset to select an image for question answering.
            </p>
          </div>
        )}
      </div>

      {/* Question Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label
            htmlFor="input-vqa-question"
            className="block text-sm font-semibold text-slate-900 dark:text-white"
          >
            Ask a question about the selected image...
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HelpCircle className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="input-vqa-question"
              type="text"
              value={question}
              onChange={(e) => {
                onQuestionChange(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g. What color is the car? What is the person doing? Describe the scene."
              disabled={isAnswering || !selectedImage}
              className="block w-full pl-10 pr-28 py-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-xs"
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center">
              <button
                id="btn-ask-gemini"
                type="submit"
                disabled={isAnswering || !selectedImage}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-white shadow transition-colors"
              >
                {isAnswering ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask Gemini</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Example Questions */}
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Example visual questions (Click to ask):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleChipClick(q)}
                  disabled={isAnswering || !selectedImage}
                  className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Answer Output Section */}
      <div id="vqa-answer-section" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              VQA Grounded Response
            </h2>
          </div>
          {vqaResult && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Confidence: {vqaResult.confidence}
            </span>
          )}
        </div>

        {/* Loading Spinner */}
        {isAnswering && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Gemini Multimodal Vision is processing the image...
            </p>
            <p className="text-xs text-slate-400 max-w-sm text-center">
              Aligning visual tokens from the image with the natural-language question to generate a factually grounded answer.
            </p>
          </div>
        )}

        {/* Answer Display */}
        {!isAnswering && vqaResult && (
          <div className="space-y-4">
            {/* Visual Question Box */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                VISUAL QUESTION
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {vqaResult.question}
              </p>
            </div>

            {/* AI Answer Box */}
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80">
              <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>AI ANSWER</span>
              </div>
              <p className="text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                {vqaResult.answer}
              </p>
            </div>

            {/* Visual Evidence & Reasoning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Visual Evidence Spotted
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {vqaResult.visualEvidence}
                </p>
              </div>

              {vqaResult.reasoningStep ? (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Multimodal Reasoning Chain
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {vqaResult.reasoningStep}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Inference Engine
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Zero-shot multimodal cross-modal attention via Google GenAI SDK.
                  </p>
                </div>
              )}
            </div>

            {/* Entities Identified */}
            {vqaResult.keyEntities && vqaResult.keyEntities.length > 0 && (
              <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <span className="font-medium text-slate-500">Entities detected:</span>
                <div className="flex flex-wrap gap-1">
                  {vqaResult.keyEntities.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Idle Prompt */}
        {!isAnswering && !vqaResult && (
          <div className="py-10 text-center text-slate-400">
            <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Select an image and enter a question above to start Visual Question Answering.
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Gemini will ground its answer strictly in the visual evidence observed in the image pixels.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
