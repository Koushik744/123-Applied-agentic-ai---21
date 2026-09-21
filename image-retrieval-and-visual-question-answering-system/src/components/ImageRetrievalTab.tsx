import React, { useState } from "react";
import { Search, Sparkles, Award, ArrowRight, AlertCircle, CheckCircle, Tag, Eye } from "lucide-react";
import { UploadedImage, RetrievalResponse, RetrievalResultItem } from "../types";

interface ImageRetrievalTabProps {
  images: UploadedImage[];
  retrievalQuery: string;
  onQueryChange: (q: string) => void;
  onExecuteRetrieval: (query: string) => void;
  retrievalResults: RetrievalResponse | null;
  isRetrieving: boolean;
  onSelectForVQA: (image: UploadedImage, initialQuestion?: string) => void;
  selectedImageId?: string;
}

const EXAMPLE_QUERIES = [
  "Find images containing a car",
  "Find a person wearing a red shirt",
  "Find images of food",
  "Find a dog outdoors",
  "Find an image containing a laptop",
  "Find a red car near a building",
];

export const ImageRetrievalTab: React.FC<ImageRetrievalTabProps> = ({
  images,
  retrievalQuery,
  onQueryChange,
  onExecuteRetrieval,
  retrievalResults,
  isRetrieving,
  onSelectForVQA,
  selectedImageId,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setErrorMsg("No images have been uploaded. Please upload at least one image or load the sample dataset.");
      return;
    }
    if (!retrievalQuery.trim()) {
      setErrorMsg("Please enter a search query (e.g. 'Find a dog outdoors').");
      return;
    }
    setErrorMsg(null);
    onExecuteRetrieval(retrievalQuery.trim());
  };

  const handleSelectQueryChip = (chip: string) => {
    onQueryChange(chip);
    if (images.length > 0) {
      setErrorMsg(null);
      onExecuteRetrieval(chip);
    }
  };

  // Find corresponding uploaded image by ID
  const getImageById = (id: string): UploadedImage | undefined => {
    return images.find((img) => img.id === id);
  };

  // Filter top 3 results
  const topResults = retrievalResults ? retrievalResults.results.slice(0, 3) : [];
  const hasNoRelevant =
    retrievalResults &&
    (topResults.length === 0 || topResults.every((r) => !r.isRelevant && r.relevanceScore < 0.35));

  return (
    <div id="image-retrieval-tab" className="space-y-6">
      {/* Search Box Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              2. Semantic Image Search / Retrieval
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Multimodal Embedding & Cross-Attention
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter a natural-language description. Gemini multimodal reasoning compares semantic tokens against each candidate image to rank relevance.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="input-retrieval-query"
              type="text"
              value={retrievalQuery}
              onChange={(e) => {
                onQueryChange(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Describe what you want to find... (e.g. Find an image containing a red car)"
              disabled={isRetrieving}
              className="block w-full pl-10 pr-28 py-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-xs"
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center">
              <button
                id="btn-search-images"
                type="submit"
                disabled={isRetrieving || images.length === 0}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-white shadow transition-colors"
              >
                {isRetrieving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Retrieving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Example Queries Chips */}
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Example test queries (Click to run):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_QUERIES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleSelectQueryChip(example)}
                  disabled={isRetrieving}
                  className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  "{example}"
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

      {/* TOP RETRIEVED IMAGES Section */}
      <div id="top-retrieved-images-section" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                TOP RETRIEVED IMAGES
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Top 3 candidate images ranked by Gemini multimodal semantic score
            </p>
          </div>

          {retrievalResults && (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Query: "{retrievalResults.query}"
              </span>
              <span>•</span>
              <span>{retrievalResults.totalEvaluated} images evaluated</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isRetrieving && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Processing multimodal semantic retrieval...
            </p>
            <p className="text-xs text-slate-400 max-w-sm text-center">
              Gemini 3.8 Flash is inspecting visual tokens, recognizing entities, and computing similarity scores for candidate images.
            </p>
          </div>
        )}

        {/* Results Available */}
        {!isRetrieving && retrievalResults && !hasNoRelevant && topResults.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topResults.map((result: RetrievalResultItem, idx: number) => {
                const img = getImageById(result.id);
                if (!img) return null;
                const isSelected = selectedImageId === img.id;
                const percentage = Math.round((result.relevanceScore || 0) * 100);

                return (
                  <div
                    key={result.id}
                    id={`top-retrieved-card-${idx + 1}`}
                    className={`flex flex-col rounded-xl border overflow-hidden transition-all duration-200 ${
                      isSelected
                        ? "border-indigo-600 ring-2 ring-indigo-500/30 shadow-md bg-indigo-50/20 dark:bg-indigo-950/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-indigo-300 dark:hover:border-slate-700 shadow-xs"
                    }`}
                  >
                    {/* Header with Rank & Relevance Score */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                            idx === 0
                              ? "bg-amber-500 ring-2 ring-amber-300"
                              : idx === 1
                              ? "bg-slate-400"
                              : "bg-amber-700"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Rank {result.rank}
                        </span>
                      </div>

                      {/* Genuine Score Display */}
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Score:</span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            percentage >= 70
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                              : percentage >= 40
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {percentage}% ({result.relevanceScore.toFixed(2)})
                        </span>
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="w-full aspect-16/10 bg-slate-900 overflow-hidden relative group">
                      <img
                        src={img.previewUrl}
                        alt={img.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[11px] font-mono text-slate-200">
                        {img.filename}
                      </div>
                    </div>

                    {/* Reasoning & Visual Evidence */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Semantic Match Reason:
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          {result.matchReason}
                        </p>

                        {/* Detected Entities */}
                        {result.detectedEntities && result.detectedEntities.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {result.detectedEntities.map((entity, eIdx) => (
                              <span
                                key={eIdx}
                                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60"
                              >
                                <Tag className="w-2.5 h-2.5" />
                                <span>{entity}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Select for VQA Action */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        <button
                          type="button"
                          id={`btn-select-vqa-rank-${idx + 1}`}
                          onClick={() => onSelectForVQA(img)}
                          className={`w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors shadow-xs ${
                            isSelected
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Active Target for VQA</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Select for Visual QA</span>
                              <ArrowRight className="w-3 h-3 ml-0.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pipeline Notice */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>
                Retrieval Method:{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  {retrievalResults.retrievalMethod}
                </strong>
              </span>
              <span className="text-[11px] text-slate-400">
                Top match automatically prioritized for downstream Visual Question Answering
              </span>
            </div>
          </div>
        )}

        {/* No Relevant Found State */}
        {!isRetrieving && hasNoRelevant && (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No relevant image was found for this query.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              None of the candidate images met the semantic similarity threshold for "{retrievalResults?.query}".
              Try uploading more images or adjusting your query (e.g. "Find an image of food" or "Find a dog outdoors").
            </p>
          </div>
        )}

        {/* Idle Prompt State */}
        {!isRetrieving && !retrievalResults && (
          <div className="py-10 text-center text-slate-400">
            <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Enter a search query above to initiate multimodal retrieval.
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              The system will evaluate your candidate images and rank the top 3 matches with genuine semantic similarity scores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
