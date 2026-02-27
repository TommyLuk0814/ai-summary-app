'use client';

import { useEffect, useState } from 'react';

interface Document {
  name: string;
  created_at: string;
  metadata: {
    size: number;
  };
}

export default function DocumentList({ refreshTrigger }: { refreshTrigger: number }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/documents/list');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load documents');
      } else {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  const handlePreview = async (filename: string) => {
    try {
      const response = await fetch(`/api/documents/download?filename=${encodeURIComponent(filename)}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to generate preview URL');
      } else {
        // Open in new window for preview
        window.open(data.downloadUrl, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview error');
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    setDeleting(filename);
    try {
      const response = await fetch(`/api/documents/delete?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to delete document');
     } else {
        // Remove from list
        setDocuments(documents.filter(doc => doc.name !== filename));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete error');
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 border border-gray-300 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Uploaded Documents</h2>

      {error && <p className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</p>}

      {loading && <p className="text-gray-600">Loading documents...</p>}

      {!loading && documents.length === 0 && (
        <p className="text-gray-600">No documents uploaded yet. Upload one to get started!</p>
      )}

      {!loading && documents.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3 text-left">Filename</th>
                <th className="border p-3 text-left">Size</th>
                <th className="border p-3 text-left">Uploaded</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.name} className="border hover:bg-gray-50">
                  <td className="border p-3">{doc.name}</td>
                  <td className="border p-3">{formatFileSize(doc.metadata?.size || 0)}</td>
                  <td className="border p-3">{formatDate(doc.created_at)}</td>
                  <td className="border p-3">
                    <button
                      onClick={() => handlePreview(doc.name)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded mr-2"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDelete(doc.name)}
                      disabled={deleting === doc.name}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-1 px-3 rounded"
                    >
                      {deleting === doc.name ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}