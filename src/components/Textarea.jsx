const Textarea = ({ className = '', ...rest }) => {
  return (
    <textarea
      {...rest}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-vertical ${className}`}
    />
  );
};

export default Textarea;