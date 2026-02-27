'use client';

import { useState } from 'react';

interface FileUploaderProps {
  onUploadSuccess: () => void;
}

export default function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError('');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Upload failed');
      } else {
        setMessage(`File uploaded successfully: ${data.filename}`);
        setFile(null);
        // Reset file input
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) input.value = '';
        // Trigger refresh of document list
        onUploadSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 border border-gray-300 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
      
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full mb-4 p-2 border border-gray-200 rounded"
      />

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}