export default function CartItem({item, onUpdate, onRemove}) {
  const image = item.product_variants?.image_url ? import.meta.env.VITE_API_URL + item.product_variants?.image_url : item.image || 'https://via.placeholder.com/100';

  // Function to format price to VND
  const formatPrice = (price) => {
    const vndPrice = price; // Assuming 1 USD = 25,000 VND
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vndPrice);
  };
    
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 py-3">
      <img src={image} alt={item.product_variants.products.product_name} className="w-20 h-20 object-cover rounded" />
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{item.product_variants.products.product_name}</h3>
        <p className="text-gray-700">{formatPrice(Number(item.product_variants.price) || 0)} x {item.quantity}</p>
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => onUpdate(item.cart_item_id, Math.max(1, item.quantity - 1))} className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded transition font-medium">-</button>
          <span className="text-gray-700 font-medium">{item.quantity}</span>
          <button onClick={() => onUpdate(item.cart_item_id, item.quantity + 1)} className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded transition font-medium">+</button>
          <button onClick={() => onRemove(item.cart_item_id)} className="ml-3 text-red-600 hover:text-red-700 font-medium transition">Xóa</button>
        </div>
      </div>
      <div className="font-semibold text-gray-900">{formatPrice(item.quantity * Number(item.product_variants.price || 0))}</div>
    </div>
  );
}
