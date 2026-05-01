import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../store/slices/orderSlice';
import { removeAllCartItem } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { addressService } from '../services/addressService';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const { user_cart } = useSelector((state) => state.cart);
  // Function to format price to VND
  const formatPrice = (price) => {
    const vndPrice = price; // Assuming 1 USD = 25,000 VND
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vndPrice);
  };
  const [addresses, setAddresses] = useState([]);
  const [wardDetails, setWardDetails] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [promo, setPromo] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    receiver_name: '',
    phone: '',
    province: '',
    province_id: '',
    ward_id: 0,
    address_detail: '',
    is_default: false,
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const total = useMemo(() => user_cart?.cart_items?.reduce((sum, item) => sum + (item.quantity || 0) * Number(item.product_variants.price || 0), 0), [user_cart.cart_items]);
  const discount = promo === 'SAVE10' ? 0.1 : 0;
  const grandTotal = total - total * discount;

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await addressService.getAddresses();
        setAddresses(response.data);
        const defaultAddr = response.data.find(addr => addr.is_default);
        if (defaultAddr) setSelectedAddress(defaultAddr);

        // Fetch ward details for each address
        const details = {};
        for (const addr of response.data) {
          if (addr.ward_id) {
            try {
              const wardRes = await addressService.getWardDetail(addr.ward_id);
              details[addr.address_id] = wardRes.data;
            } catch (err) {
              console.error(`Failed to fetch ward detail for ward_id ${addr.ward_id}:`, err);
            }
          }
        }
        setWardDetails(details);
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      }
    };

    const fetchProvinces = async () => {
      try {
        const response = await addressService.getProvinces();
        setProvinces(response.data);
      } catch (err) {
        console.error('Failed to fetch provinces:', err);
      }
    };

    if (user?.user_id) {
      fetchAddresses();
      fetchProvinces();
    }
  }, [user?.user_id]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedProvinceId) {
        setWards([]);
        return;
      }
      try {
        const response = await addressService.getWardsByProvince(selectedProvinceId);
        console.log(response);
        
        setWards(response.data);
      } catch (err) {
        console.error('Failed to fetch wards:', err);
      }
    };
    fetchWards();
  }, [selectedProvinceId]);  

  useEffect(() => {
    if (editingAddress && provinces.length) {
      const selectedProvince = provinces.find((province) => province.name === editingAddress.province);
      if (selectedProvince) {
        setSelectedProvinceId(selectedProvince.id);
      }
    }
  }, [editingAddress, provinces]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user_cart?.cart_items?.length) {
      setError('Giỏ hàng trống');
      return;
    }
    if (!selectedAddress) {
      setError('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const orderData = {
        customer_id: user?.user_id,
        address_id: selectedAddress.address_id,
        order_status: 'PENDING',
        payment_status: paymentMethod === 'COD' ? 'UNPAID' : 'PENDING',
        total_amount: Number(grandTotal),
        payment_method: paymentMethod,
        items: user_cart?.cart_items?.map((item) => {
          const orderItem = {
            variant_id: item.product_variants.variant_id,
            quantity: item.quantity,
            unit_price: Number(item.product_variants.price),
            render_id: item.render_id
          };
          if (item.render_id) {
            orderItem.render_id = item.render_id;
          }
          return orderItem;
        }),
      };
      const response = await dispatch(placeOrder(orderData)).unwrap();
      if (paymentMethod === 'VNPAY' && response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        dispatch(removeAllCartItem(user_cart.cart_id));
        setStatus('succeeded');
        setTimeout(() => navigate('/orders'), 1200);
      }
    } catch (err) {
      setError(err?.message || 'Thanh toán thất bại');
      setStatus('failed');
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setSelectedProvinceId('');
    setWards([]);
    setAddressForm({
      receiver_name: '',
      phone: '',
      province: '',
      province_id: '',
      ward_id: 0,
      address_detail: '',
      is_default: false,
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    const wardDetail = wardDetails[address.address_id];
    const selectedProvince = wardDetail?.provinces;
    
    setEditingAddress(address);
    setSelectedProvinceId(selectedProvince?.id || '');
    setAddressForm({
      receiver_name: address.receiver_name,
      phone: address.phone,
      province: selectedProvince?.name || '',
      province_id: selectedProvince?.id || '',
      ward_id: address.ward_id || '',
      address_detail: address.address_detail,
      is_default: address.is_default,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    try {
      const { province_id, province, ...payload } = addressForm;
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.address_id, payload);
      } else {
        
        await addressService.createAddress(payload);
      }
      const response = await addressService.getAddresses();
      setAddresses(response.data);

      // Fetch ward details for updated addresses
      const details = { ...wardDetails };
      for (const addr of response.data) {
        if (addr.ward_id && !details[addr.address_id]) {
          try {
            const wardRes = await addressService.getWardDetail(addr.ward_id);
            details[addr.address_id] = wardRes.data;
          } catch (err) {
            console.error(`Failed to fetch ward detail for ward_id ${addr.ward_id}:`, err);
          }
        }
      }
      setWardDetails(details);
      setShowAddressModal(false);
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xoá địa chỉ này không?')) {
      try {
        await addressService.deleteAddress(id);
        const response = await addressService.getAddresses();
        setAddresses(response.data);
        if (selectedAddress?.address_id === id) {
          setSelectedAddress(null);
        }
        // Remove ward details for deleted address
        const newDetails = { ...wardDetails };
        delete newDetails[id];
        setWardDetails(newDetails);
      } catch (err) {
        console.error('Failed to delete address:', err);
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      const response = await addressService.getAddresses();
      setAddresses(response.data);
    } catch (err) {
      console.error('Failed to set default address:', err);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-4 mt-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Thanh toán đơn hàng</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ tên đầy đủ</label>
            <input value={selectedAddress?.receiver_name || user?.username || ''} readOnly className="mt-1 w-full border border-gray-300 rounded p-2 bg-gray-50 text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input value={selectedAddress?.phone || ''} readOnly className="mt-1 w-full border border-gray-300 rounded p-2 bg-gray-50 text-gray-700" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Địa chỉ giao hàng của bạn</label>
          {selectedAddress ? (
            <div className="mt-1 p-2 border border-gray-200 rounded bg-gray-50">
              <p><strong>{selectedAddress.receiver_name}</strong></p>
              <p>{selectedAddress.phone}</p>
              <p>
                {selectedAddress.address_detail}
                {wardDetails[selectedAddress.address_id] && (
                  <>
                    , {wardDetails[selectedAddress.address_id].name}
                    , {wardDetails[selectedAddress.address_id].provinces?.name}
                  </>
                )}
              </p>
              {selectedAddress.is_default && <span className="text-gray-600 text-sm font-medium">Mặc định</span>}
            </div>
          ) : (
            <p className="mt-1 text-gray-500">Chưa chọn địa chỉ giao hàng</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Chọn địa chỉ giao hàng</label>
          <div className="space-y-2">
            {addresses.map((addr) => (
              <div key={addr.address_id} className="flex items-center space-x-2 p-2 border border-gray-200 rounded">
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddress?.address_id === addr.address_id}
                  onChange={() => setSelectedAddress(addr)}
                />
                <div className="flex-1">
                  <p><strong>{addr.receiver_name}</strong> {addr.phone}</p>
                  <p className="text-sm text-gray-600">
                    {addr.address_detail}
                    {wardDetails[addr.address_id] && (
                      <>
                        , {wardDetails[addr.address_id].name}
                        , {wardDetails[addr.address_id].provinces?.name}
                      </>
                    )}
                  </p>
                  {addr.is_default && <span className="text-gray-600 text-xs">Mặc định</span>}
                </div>
                <button onClick={() => handleEditAddress(addr)} className="text-gray-700 text-sm hover:text-gray-900 font-medium">Sửa</button>
                <button onClick={() => handleDeleteAddress(addr.address_id)} className="text-gray-500 text-sm hover:text-gray-700 font-medium">Xóa</button>
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.address_id)} className="text-gray-600 text-sm hover:text-gray-800 font-medium">Đặt mặc định</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={handleAddAddress} className="mt-2 text-gray-700 hover:text-gray-900 font-medium">+ Thêm địa chỉ giao hàng mới</button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mã giảm giá</label>
          <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="SAVE10" className="mt-1 w-full border border-gray-300 rounded p-2 bg-white text-gray-700 focus:border-gray-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              Thanh toán khi nhận hàng (COD)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="VNPAY"
                checked={paymentMethod === 'VNPAY'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              Thanh toán online qua VNPay
            </label>
          </div>
        </div>

        <div className="flex justify-between text-lg font-semibold">
          <span>Tổng tiền đơn hàng</span>
          <span>{formatPrice(total || 0)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold">
          <span>Giảm giá</span>
          <span>{formatPrice(total ? (total * discount) : 0)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold">
          <span>Tổng tiền cần thanh toán</span>
          <span>{formatPrice(grandTotal || 0)}</span>
        </div>
        <div>
          <span style={{color: "red"}}>Lưu ý: Số tiền trên chưa bao gồm phí ship. Nhân viên sẽ liên hệ thông báo phí ship sau khi xác nhận đơn hàng.</span>
        </div>

        <button disabled={status === 'loading'} onClick={handleSubmit} className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 disabled:opacity-60 font-medium transition">
          {status === 'loading' ? 'Đang đặt hàng...' : 'Đặt hàng'}
        </button>

        {status === 'loading' && <LoadingSpinner message="Đang gửi đơn hàng..." />}
        {error && <p className="text-red-600 font-medium">{error}</p>}
        {status === 'succeeded' && <p className="text-green-600 font-medium">Đơn hàng đã thành công. Chuyển hướng đến đơn hàng...</p>}
      </div>

      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">{editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ giao hàng mới'}</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tên người nhận"
                value={addressForm.receiver_name}
                onChange={(e) => setAddressForm({...addressForm, receiver_name: e.target.value})}
                className="w-full border border-gray-300 rounded p-2 bg-white text-gray-700 focus:border-gray-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                className="w-full border border-gray-300 rounded p-2 bg-white text-gray-700 focus:border-gray-500 focus:outline-none"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
                <select
                  value={addressForm.province_id}
                  onChange={(e) => {
                    const provinceId = e.target.value;
                    const province = provinces.find((item) => String(item.id) === provinceId);
                    setSelectedProvinceId(provinceId);
                    setAddressForm({
                      ...addressForm,
                      province: province ? province.name : '',
                      province_id: provinceId,
                    });
                  }}
                  className="w-full border border-gray-300 rounded p-2 bg-white text-gray-700 focus:border-gray-500 focus:outline-none"
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.province_id} value={province.province_id}>{province.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phường/Xã</label>
                <select
                  value={addressForm.ward_id}
                  onChange={(e) => {
                    const wardId = e.target.value;
                    const ward = wards.find((item) => String(item.id) === wardId);
                    setAddressForm({...addressForm, ward_id: Number(wardId)});
                  }}
                  className="w-full border border-gray-300 rounded p-2 bg-white text-gray-700 focus:border-gray-500 focus:outline-none"
                  disabled={!wards.length}
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map((ward) => (
                    <option key={ward.ward_id} value={ward.ward_id}>{ward.name}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Chi tiết địa chỉ"
                value={addressForm.address_detail}
                onChange={(e) => setAddressForm({...addressForm, address_detail: e.target.value})}
                className="w-full border border-gray-300 rounded p-2 bg-white text-gray-700 focus:border-gray-500 focus:outline-none"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                  className="w-4 h-4 border-gray-300 rounded accent-gray-700"
                />
                <span className="text-gray-700">Sở dụng làm địa chỉ mặc định</span>
              </label>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowAddressModal(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium">Hủy</button>
              <button onClick={handleSaveAddress} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 font-medium">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
