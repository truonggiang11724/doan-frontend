export default function Input({ className = '', ...rest }) {
  return (
    <input
      {...rest}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-700 ${className}`}
    />
  );
}
