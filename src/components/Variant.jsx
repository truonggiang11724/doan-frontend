const Variant = ({ data, emptyMessage = 'No data available' }) => {

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200" rowSpan="2">
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
                <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-900">
                  <img src={'http://localhost:3000'+row.image_url} alt="Ảnh biến thể" className="w-12 h-12 object-cover rounded" />
                  
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Màu {row.color}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                 Size {row.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Giá: {row.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Số lượng: {row.stock_quantity}
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Variant;