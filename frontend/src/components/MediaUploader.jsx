import React from "react";
import { FiUploadCloud, FiX, FiPlus } from "react-icons/fi";

export default function MediaUploader({ files, setFiles, previews, setPreviews, maxFiles = 5, setToast }) {
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      if (files.length + selectedFiles.length > maxFiles) {
        return setToast({message: `You can only upload a maximum of ${maxFiles} files.`, type: "error"});
      }

      setFiles(prev => [...prev, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type
      }));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`border-2 border-dashed rounded-3xl min-h-96 flex flex-col items-center justify-center transition-all ${previews.length > 0 ? 'border-gray-300 bg-gray-50' : 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100'}`}>
      {previews.length > 0 ? (
        <div className="w-full p-4 overflow-x-auto">
          <div className="flex gap-4 pb-2">
            {previews.map((prev, index) => (
              <div key={index} className="relative flex-shrink-0 w-64 h-80 bg-black rounded-2xl overflow-hidden shadow-lg">
                 {prev.type.startsWith("video") ? <video src={prev.url} controls className="w-full h-full object-contain" /> : <img src={prev.url} alt="Preview" className="w-full h-full object-contain" />}
                <button type="button" onClick={() => removeFile(index)} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"><FiX size={16} /></button>
              </div>
            ))}
            {files.length < maxFiles && (
              <label className="flex-shrink-0 w-32 h-80 border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-colors">
                  <FiPlus className="text-indigo-400 mb-2" size={24} />
                  <span className="text-xs font-bold text-indigo-400">Add More</span>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" multiple />
              </label>
            )}
          </div>
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center p-8 w-full h-full justify-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4"><FiUploadCloud size={32} /></div>
          <span className="text-lg font-semibold text-indigo-900">Click to upload photos or videos</span>
          <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" multiple />
        </label>
      )}
    </div>
  );
}