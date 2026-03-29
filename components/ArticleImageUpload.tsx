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
      // Transfer file ke input agar bisa dikirim via form
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
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        Upload Gambar Sampul
      </label>

      {preview ? (
        // Show preview
        <div className="relative rounded-xl overflow-hidden border-2 border-[#0d88b5] group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-[260px] object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors"
            >
              Ganti Foto
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-white text-xs font-medium truncate">{fileName}</span>
            </div>
          </div>
        </div>
      ) : (
        // Show drop zone
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-[#0d88b5] bg-[#ebf5fa] scale-[1.01]"
              : "border-gray-200 hover:border-[#0d88b5] hover:bg-gray-50"
          }`}
        >
          <div className="text-center">
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${
              isDragging ? "bg-[#0d88b5]/10" : "bg-gray-100"
            }`}>
              <ImagePlus className={`w-7 h-7 transition-colors ${isDragging ? "text-[#0d88b5]" : "text-gray-400"}`} />
            </div>
            <p className="text-sm font-bold text-gray-700">
              <span className="text-[#0d88b5]">Klik untuk pilih foto</span>{" "}
              atau seret ke sini
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hingga 10MB</p>
          </div>
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
