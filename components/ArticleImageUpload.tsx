"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, CheckCircle } from "lucide-react";

export default function ArticleImageUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
        Gambar Sampul Artikel
      </label>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-[300px] object-cover bg-gray-100 dark:bg-zinc-800"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
             <button
               type="button"
               onClick={() => inputRef.current?.click()}
               className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors shadow-md"
             >
               Ganti Foto
             </button>
             <button
               type="button"
               onClick={handleRemove}
               className="bg-red-500 text-white p-2.5 rounded-lg hover:bg-red-600 transition-colors shadow-md"
             >
               <X className="w-5 h-5" />
             </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-white text-xs font-medium truncate">{fileName}</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-zinc-800"
          }`}
        >
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
              isDragging ? "bg-blue-100 text-blue-600" : "bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-gray-400"
            }`}>
             <ImagePlus className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
            <span className="text-blue-600 dark:text-blue-400">Klik untuk unggah</span> atau seret file ke sini
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Format PNG, JPG, JPEG (Maks. 10MB)</p>
        </div>
      )}

      <input
        ref={inputRef}
        id="file-upload"
        name="featuredImg"
        type="file"
        className="sr-only"
        accept="image/*"
        onChange={handleChange}
      />
    </div>
  );
}
