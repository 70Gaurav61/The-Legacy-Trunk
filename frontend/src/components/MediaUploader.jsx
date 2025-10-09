import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'


export default function MediaUploader({ onFiles }) {
    const onDrop = useCallback((acceptedFiles) => {
        onFiles && onFiles(acceptedFiles)
    }, [onFiles])


    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true })


    return (
        <div {...getRootProps()} className="p-6 border-2 border-dashed rounded-lg text-center bg-white">
            <input {...getInputProps()} />
            {isDragActive ? <p>Drop the files here ...</p> : <p>Drag & drop media here, or click to select files</p>}
            <p className="text-xs text-gray-500 mt-2">Images, audio, video (max 50MB each)</p>
        </div>
    )
}