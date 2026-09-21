import React, { useRef, useState } from "react";
import { Upload, Trash2, CheckCircle, Database, Plus, Image as ImageIcon } from "lucide-react";
import { UploadedImage } from "../types";

interface ImageUploaderProps {
  images: UploadedImage[];
  onAddImages: (newImages: UploadedImage[]) => void;
  onRemoveImage: (id: string) => void;
  onClearAll: () => void;
  onLoadSamples: () => void;
  selectedImageId?: string;
  onSelectImage: (image: UploadedImage) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onAddImages,
  onRemoveImage,
  onClearAll,
  onLoadSamples,
  selectedImageId,
  onSelectImage,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (supportedTypes.includes(file.type.toLowerCase())) {
        validFiles.push(file);
      } else {
        setUploadError(`Skipped "${file.name}": Unsupported format. Allowed formats: JPG, JPEG, PNG, WEBP.`);
      }
    }

    if (validFiles.length === 0) {
      if (!uploadError) {
        setUploadError("Please upload valid JPG, JPEG, PNG, or WEBP images.");
      }
      return;
    }

    const readPromises = validFiles.map((file) => {
      return new Promise<UploadedImage>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, "");
          resolve({
            id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            filename: file.name,
            mimeType: file.type || "image/jpeg",
            data: base64Data,
            previewUrl: dataUrl,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            source: "upload",
          });
        };
        reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
        reader.readAsDataURL(file);
      });
    });

    try {
      const newImages = await Promise.all(readPromises);
      onAddImages(newImages);
      // Auto select the first if none selected
      if (!selectedImageId && newImages.length > 0) {
        onSelectImage(newImages[0]);
      }
    } catch (err: any) {
      setUploadError(err.message || "An error occurred while loading images.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div id="image-upload-section" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              1. Upload Images
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {images.length} candidate{images.length === 1 ? "" : "s"} loaded
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Supported formats: JPG, JPEG, PNG, WEBP. Upload multiple images to form your retrieval dataset.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-load-sample-dataset"
            type="button"
            onClick={onLoadSamples}
            disabled={disabled}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Load Sample Dataset (6 Images)</span>
          </button>

          {images.length > 0 && (
            <button
              id="btn-clear-all-images"
              type="button"
              onClick={onClearAll}
              disabled={disabled}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            onClick={() => setUploadError(null)}
            className="font-bold ml-2 text-amber-900 dark:text-amber-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-400/20"
            : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/30"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              Click to select files
            </span>{" "}
            or drag and drop multiple images here
          </div>
          <p className="text-[11px] text-slate-400">
            Supported: JPG, JPEG, PNG, WEBP (Batch upload supported)
          </p>
        </div>
      </div>

      {/* Uploaded Images Gallery Cards */}
      {images.length > 0 ? (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Candidate Dataset (Click thumbnail to inspect or select for VQA)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((img, index) => {
              const isSelected = selectedImageId === img.id;

              return (
                <div
                  key={img.id}
                  id={`image-card-${index + 1}`}
                  onClick={() => onSelectImage(img)}
                  className={`group relative flex flex-col rounded-lg border overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? "border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/40 shadow-md bg-indigo-50/20 dark:bg-indigo-950/40"
                      : "border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                  }`}
                >
                  {/* Thumbnail Number Badge */}
                  <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white shadow">
                    #{index + 1}
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded bg-indigo-600 text-[10px] font-semibold text-white flex items-center space-x-1 shadow">
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>VQA Target</span>
                    </div>
                  )}

                  {/* Image Thumbnail */}
                  <div className="w-full aspect-4/3 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                    <img
                      src={img.previewUrl}
                      alt={img.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Metadata & Actions */}
                  <div className="p-2 flex flex-col justify-between flex-1">
                    <div>
                      <p
                        className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate"
                        title={img.filename}
                      >
                        {img.filename}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>Image #{index + 1}</span>
                        <span>{img.fileSize}</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {isSelected ? "Active" : "Select"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveImage(img.id);
                        }}
                        disabled={disabled}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center">
          <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            No images have been uploaded. Please upload at least one image or load the sample dataset.
          </p>
          <button
            type="button"
            onClick={onLoadSamples}
            className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-md border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Load 6 Demo Images Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
