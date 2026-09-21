/**
 * Image Retrieval and Visual Question Answering System
 * College-Level Multimodal AI Pipeline using Google Gemini 3.8 Flash
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { PipelineVisualization } from "./components/PipelineVisualization";
import { ImageUploader } from "./components/ImageUploader";
import { ImageRetrievalTab } from "./components/ImageRetrievalTab";
import { VisualQuestionAnsweringTab } from "./components/VisualQuestionAnsweringTab";
import { ExperimentResultPanel } from "./components/ExperimentResultPanel";
import { EndToEndRunnerModal } from "./components/EndToEndRunnerModal";
import { AboutExperimentModal } from "./components/AboutExperimentModal";
import { PresentationModeModal } from "./components/PresentationModeModal";
import { generateSampleDataset } from "./data/sampleImages";
import {
  UploadedImage,
  RetrievalResponse,
  VQAResponse,
  ExperimentSummary,
  PipelineStep,
} from "./types";
import { Search, Eye, AlertCircle, Sparkles, Database } from "lucide-react";

export default function App() {
  // Navigation Mode (Tab 1: IMAGE RETRIEVAL, Tab 2: VISUAL QUESTION ANSWERING)
  const [activeTab, setActiveTab] = useState<"retrieval" | "vqa">("retrieval");

  // Image Dataset State
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);

  // Retrieval State
  const [retrievalQuery, setRetrievalQuery] = useState("Find an image containing a red car");
  const [retrievalResults, setRetrievalResults] = useState<RetrievalResponse | null>(null);
  const [isRetrieving, setIsRetrieving] = useState(false);

  // VQA State
  const [vqaQuestion, setVqaQuestion] = useState("What color is the car, and describe the background scene.");
  const [vqaResult, setVqaResult] = useState<VQAResponse | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Pipeline Visualization & Progress
  const [currentPipelineStage, setCurrentPipelineStage] = useState<number>(1);
  const [isProcessingPipeline, setIsProcessingPipeline] = useState<boolean>(false);

  // Experiment Result Summary (Query → Retrieval → Image → Vision → Answer)
  const [experimentSummary, setExperimentSummary] = useState<ExperimentSummary | null>(null);

  // Modals
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isEndToEndOpen, setIsEndToEndOpen] = useState(false);
  const [isExecutingEndToEnd, setIsExecutingEndToEnd] = useState(false);

  // Global Notification / Error
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Pre-load sample images on startup so the college demonstration is ready immediately
  useEffect(() => {
    try {
      const initialSamples = generateSampleDataset();
      setImages(initialSamples);
      if (initialSamples.length > 0) {
        setSelectedImage(initialSamples[0]);
      }
    } catch (e) {
      console.warn("Sample dataset initialization notice:", e);
    }
  }, []);

  // Handlers for Images
  const handleAddImages = (newImages: UploadedImage[]) => {
    setImages((prev) => [...prev, ...newImages]);
    setCurrentPipelineStage(2);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImage?.id === id) {
      const remaining = images.filter((img) => img.id !== id);
      setSelectedImage(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleClearAllImages = () => {
    setImages([]);
    setSelectedImage(null);
    setRetrievalResults(null);
    setVqaResult(null);
    setExperimentSummary(null);
    setCurrentPipelineStage(1);
  };

  const handleLoadSamples = () => {
    const samples = generateSampleDataset();
    setImages(samples);
    if (samples.length > 0) {
      setSelectedImage(samples[0]);
    }
    setCurrentPipelineStage(2);
  };

  // API Call: Execute Multimodal Image Retrieval
  const executeRetrieval = async (queryText: string): Promise<RetrievalResponse | null> => {
    if (images.length === 0) {
      setGlobalError("No images have been uploaded. Please upload at least one image.");
      return null;
    }

    setIsRetrieving(true);
    setIsProcessingPipeline(true);
    setCurrentPipelineStage(3);
    setGlobalError(null);

    try {
      const response = await fetch("/api/gemini/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          images: images.map((img) => ({
            id: img.id,
            filename: img.filename,
            mimeType: img.mimeType,
            data: img.data,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Retrieval API error (${response.status})`);
      }

      const data: RetrievalResponse = await response.json();
      setRetrievalResults(data);
      setCurrentPipelineStage(4);

      // If results returned, prioritize the top ranked candidate
      if (data.results && data.results.length > 0) {
        const topResult = data.results[0];
        const topImage = images.find((img) => img.id === topResult.id);
        if (topImage) {
          setSelectedImage(topImage);
        }
      }

      return data;
    } catch (err: any) {
      console.error("Retrieval failed:", err);
      setGlobalError(err.message || "Failed to retrieve images. Please check server logs or GEMINI_API_KEY.");
      return null;
    } finally {
      setIsRetrieving(false);
      setIsProcessingPipeline(false);
    }
  };

  // API Call: Execute Visual Question Answering
  const executeVQA = async (targetImage: UploadedImage, questionText: string): Promise<VQAResponse | null> => {
    if (!targetImage) {
      setGlobalError("No image selected for Visual Question Answering.");
      return null;
    }

    setIsAnswering(true);
    setIsProcessingPipeline(true);
    setCurrentPipelineStage(5);
    setGlobalError(null);

    try {
      const response = await fetch("/api/gemini/vqa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: {
            filename: targetImage.filename,
            mimeType: targetImage.mimeType,
            data: targetImage.data,
          },
          question: questionText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `VQA API error (${response.status})`);
      }

      const data: VQAResponse = await response.json();
      setVqaResult(data);
      setCurrentPipelineStage(6);

      // Find ranking if exists in retrieval results
      let rank = 1;
      let score = 0.95;
      if (retrievalResults) {
        const match = retrievalResults.results.find((r) => r.id === targetImage.id);
        if (match) {
          rank = match.rank;
          score = match.relevanceScore;
        }
      }

      // Update Experiment Summary
      setExperimentSummary({
        query: retrievalQuery,
        retrievedImage: targetImage,
        relevanceRank: rank,
        relevanceScore: score,
        question: questionText,
        answer: data.answer,
        visualEvidence: data.visualEvidence,
        confidence: data.confidence,
        retrievalMethod: retrievalResults?.retrievalMethod || "Gemini 3.8 Flash Multimodal Grounding",
        timestamp: new Date().toLocaleString(),
      });

      return data;
    } catch (err: any) {
      console.error("VQA failed:", err);
      setGlobalError(err.message || "Failed to execute visual question answering.");
      return null;
    } finally {
      setIsAnswering(false);
      setIsProcessingPipeline(false);
    }
  };

  // Switch from Retrieval result to VQA Tab
  const handleSelectForVQA = (img: UploadedImage, initialQuestion?: string) => {
    setSelectedImage(img);
    if (initialQuestion) {
      setVqaQuestion(initialQuestion);
    }
    setActiveTab("vqa");
  };

  // Run End-to-End Pipeline (Feature 6)
  const handleRunEndToEnd = async (
    query: string,
    question: string,
    updateSteps: (steps: PipelineStep[]) => void
  ) => {
    setIsExecutingEndToEnd(true);
    setRetrievalQuery(query);
    setVqaQuestion(question);

    const stepsList: PipelineStep[] = [
      { id: 1, title: "STEP 1", subtitle: "Query received", status: "running", detail: `Query: "${query}"` },
      { id: 2, title: "STEP 2", subtitle: "Searching uploaded images", status: "idle" },
      { id: 3, title: "STEP 3", subtitle: "Relevant image retrieved", status: "idle" },
      { id: 4, title: "STEP 4", subtitle: "Sending image + question to Gemini", status: "idle" },
      { id: 5, title: "STEP 5", subtitle: "Generating visual answer", status: "idle" },
      { id: 6, title: "STEP 6", subtitle: "Final result", status: "idle" },
    ];

    updateSteps(stepsList);

    // Artificial delay for smooth demonstration visibility
    await new Promise((r) => setTimeout(r, 600));
    stepsList[0].status = "completed";
    stepsList[1].status = "running";
    stepsList[1].detail = `Comparing ${images.length} candidates via multimodal attention...`;
    updateSteps(stepsList);

    // Step 2 & 3: Run Retrieval
    const retrieval = await executeRetrieval(query);
    if (!retrieval || !retrieval.results || retrieval.results.length === 0) {
      stepsList[1].status = "failed";
      stepsList[1].detail = "No matching candidates found.";
      updateSteps(stepsList);
      setIsExecutingEndToEnd(false);
      return;
    }

    const topRanked = retrieval.results[0];
    const topImg = images.find((i) => i.id === topRanked.id);

    if (!topImg) {
      stepsList[1].status = "failed";
      updateSteps(stepsList);
      setIsExecutingEndToEnd(false);
      return;
    }

    stepsList[1].status = "completed";
    stepsList[2].status = "completed";
    stepsList[2].detail = `Retrieved: ${topImg.filename} (Score: ${(topRanked.relevanceScore * 100).toFixed(0)}%)`;
    setSelectedImage(topImg);

    // Step 4: Dispatch to Gemini Vision
    stepsList[3].status = "running";
    stepsList[3].detail = `Question: "${question}"`;
    updateSteps(stepsList);
    await new Promise((r) => setTimeout(r, 500));

    stepsList[3].status = "completed";
    stepsList[4].status = "running";
    stepsList[4].detail = "Gemini 3.8 Flash generating grounded visual reasoning...";
    updateSteps(stepsList);

    // Step 5 & 6: Execute VQA
    const vqa = await executeVQA(topImg, question);
    if (!vqa) {
      stepsList[4].status = "failed";
      updateSteps(stepsList);
      setIsExecutingEndToEnd(false);
      return;
    }

    stepsList[4].status = "completed";
    stepsList[5].status = "completed";
    stepsList[5].detail = `Answer: "${vqa.answer.substring(0, 70)}..."`;
    updateSteps(stepsList);

    setIsExecutingEndToEnd(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Header */}
      <Header
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onRunEndToEnd={() => setIsEndToEndOpen(true)}
        isProcessing={isRetrieving || isAnswering || isProcessingPipeline}
        totalImages={images.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Global Error Banner */}
        {globalError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm flex items-start justify-between shadow-xs">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Notification:</strong>
                <span>{globalError}</span>
              </div>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="p-1 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-100 dark:hover:bg-rose-900 rounded"
            >
              ✕
            </button>
          </div>
        )}

        {/* Multimodal Architecture Pipeline Diagram */}
        <PipelineVisualization
          currentStage={currentPipelineStage}
          isProcessing={isProcessingPipeline || isRetrieving || isAnswering}
        />

        {/* Section 1: Image Upload */}
        <ImageUploader
          images={images}
          onAddImages={handleAddImages}
          onRemoveImage={handleRemoveImage}
          onClearAll={handleClearAllImages}
          onLoadSamples={handleLoadSamples}
          selectedImageId={selectedImage?.id}
          onSelectImage={(img) => setSelectedImage(img)}
          disabled={isRetrieving || isAnswering}
        />

        {/* Mode / Tabs Switcher */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <button
                id="tab-btn-image-retrieval"
                type="button"
                onClick={() => setActiveTab("retrieval")}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "retrieval"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Search className="w-4 h-4" />
                <span>TAB 1 — IMAGE RETRIEVAL</span>
              </button>

              <button
                id="tab-btn-visual-qa"
                type="button"
                onClick={() => setActiveTab("vqa")}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "vqa"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>TAB 2 — VISUAL QUESTION ANSWERING</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 px-3 py-1 sm:text-right">
              {activeTab === "retrieval"
                ? "Search candidate images by natural language text query"
                : "Ask questions about visual details in selected image"}
            </div>
          </div>
        </div>

        {/* Tab 1 Content: Image Retrieval */}
        {activeTab === "retrieval" && (
          <ImageRetrievalTab
            images={images}
            retrievalQuery={retrievalQuery}
            onQueryChange={setRetrievalQuery}
            onExecuteRetrieval={executeRetrieval}
            retrievalResults={retrievalResults}
            isRetrieving={isRetrieving}
            onSelectForVQA={handleSelectForVQA}
            selectedImageId={selectedImage?.id}
          />
        )}

        {/* Tab 2 Content: Visual Question Answering */}
        {activeTab === "vqa" && (
          <VisualQuestionAnsweringTab
            images={images}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            question={vqaQuestion}
            onQuestionChange={setVqaQuestion}
            onAskQuestion={executeVQA}
            vqaResult={vqaResult}
            isAnswering={isAnswering}
            onSwitchToRetrievalTab={() => setActiveTab("retrieval")}
          />
        )}

        {/* Experiment Result Summary Panel */}
        <ExperimentResultPanel summary={experimentSummary} />
      </main>

      {/* College Presentation Mode Modal */}
      <PresentationModeModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
      />

      {/* About Experiment Modal */}
      <AboutExperimentModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* End-to-End Demonstration Modal */}
      <EndToEndRunnerModal
        isOpen={isEndToEndOpen}
        onClose={() => setIsEndToEndOpen(false)}
        images={images}
        onRunPipeline={handleRunEndToEnd}
        isExecuting={isExecutingEndToEnd}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>Image Retrieval and Visual Question Answering System</strong> — Multimodal AI Pipeline
          </span>
          <span>Powered by Google Gemini 3.8 Flash • Express Full-Stack Architecture</span>
        </div>
      </footer>
    </div>
  );
}
