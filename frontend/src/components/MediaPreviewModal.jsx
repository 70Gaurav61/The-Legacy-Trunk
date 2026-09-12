import React from "react";

export default function MediaPreviewModal({ file, onClose }) {
  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white text-3xl hover:text-gray-300 transition-colors"
      >
        ✕
      </button>

      <div className="max-w-5xl max-h-[90vh] w-full p-4 flex items-center justify-center">
        {file.mimeType?.startsWith("image") && (
          <img
            src={file.url}
            className="max-h-[90vh] max-w-full rounded-lg shadow-2xl"
            alt={file.originalName}
          />
        )}

        {file.mimeType?.startsWith("video") && (
          <video
            src={file.url}
            controls
            autoPlay
            className="max-h-[90vh] max-w-full rounded-lg shadow-2xl"
          />
        )}

        {!file.mimeType?.startsWith("image") &&
          !file.mimeType?.startsWith("video") && (
            <iframe src={file.url} title={file.originalName} className="w-full h-[90vh] rounded-lg bg-white shadow-2xl" />
          )}
      </div>
    </div>
  );
}