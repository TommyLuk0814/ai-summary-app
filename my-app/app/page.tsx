'use client';

import { useState } from 'react';
import FileUploader from './components/FileUploader';
import DocumentList from './components/DocumentList';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Increment trigger to refresh document list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">AI Summary App</h1>
        <FileUploader onUploadSuccess={handleUploadSuccess} />
        <DocumentList refreshTrigger={refreshTrigger} />
      </div>
    </main>
  );
}