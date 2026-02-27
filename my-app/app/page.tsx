import FileUploader from './components/FileUploader';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">AI Summary App</h1>
        <FileUploader />
      </div>
    </main>
  );
}