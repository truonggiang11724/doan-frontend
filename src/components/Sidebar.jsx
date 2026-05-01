import React from 'react';

export default function Sidebar({ position }) {
  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
      title: 'Sale mùa hè',
      subtitle: 'Giảm giá đến 50%',
      link: '#',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80',
      title: 'Bộ sưu tập mới',
      subtitle: 'Thời trang đường phố',
      link: '#',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1506629905607-0b5b8b5b9b9b?auto=format&fit=crop&w=400&q=80',
      title: 'Phụ kiện hot',
      subtitle: 'Áo hoodie & quần jean',
      link: '#',
    },
  ];

  return (
    <aside className={`fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} z-10 h-full w-64 bg-white shadow-lg border-r border-gray-200 hidden lg:block`}>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4"> </h3>
        <div className="space-y-4">
          {banners.map((banner) => (
            <div key={banner.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-3 text-white">
                  <h4 className="font-semibold text-sm">{banner.title}</h4>
                  <p className="text-xs opacity-90">{banner.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
