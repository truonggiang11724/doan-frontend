export default function Button({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={`px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
