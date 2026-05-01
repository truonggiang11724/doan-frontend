export default function LoadingSpinner({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-12 ${className}`}>
      <div className="h-6 w-6 rounded-full border-4 border-gray-800 border-t-transparent animate-spin" />
      <span className="text-sm text-gray-700">{message}</span>
    </div>
  );
}
