import React, { useState, useEffect } from 'react';
import mockupService from '../services/mockupService';

export default function MockupGenerator() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [designUrl, setDesignUrl] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState(null);
  const [mockupUrl, setMockupUrl] = useState('');
  const [renderHistory, setRenderHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await mockupService.getTemplates(true);
        setTemplates(response.data);
      } catch (err) {
        setError('Không thể tải mẫu: ' + err.message);
      }
    };

    fetchTemplates();
  }, []);

  // Fetch render history
  const fetchRenderHistory = async () => {
    try {
      const response = await mockupService.getRenderHistory(10);
      setRenderHistory(response.data);
      setShowHistory(true);
    } catch (err) {
      setError('Không thể tải lịch sử: ' + err.message);
    }
  };

  const handleRender = async () => {
    if (!selectedTemplate || !designUrl) {
      setError('Vui lòng chọn mẫu và cung cấp URL thiết kế');
      return;
    }

    setError(null);
    setRendering(true);

    try {
      const response = await mockupService.renderMockup({
        template_id: selectedTemplate.template_id,
        design_image_url: designUrl,
        render_config: {
          color: selectedColor,
        },
      });

      setMockupUrl(response.data.rendered_image_url);
      setError(null);
      
      // Refresh history after render
      fetchRenderHistory();
    } catch (err) {
      setError('Không thể kết xuất mockup: ' + err.message);
    } finally {
      setRendering(false);
    }
  };

  const handleDeleteRender = async (renderId) => {
    try {
      await mockupService.deleteRender(renderId);
      setRenderHistory(renderHistory.filter(r => r.render_id !== renderId));
    } catch (err) {
      setError('Không thể xóa render: ' + err.message);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-4 mt-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Trợ Tạo Mockup</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Generator */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Tạo Mockup Mới</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Template Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Mẫu
            </label>
            <select
              value={selectedTemplate?.template_id || ''}
              onChange={(e) => {
                const template = templates.find(
                  (t) => t.template_id === parseInt(e.target.value)
                );
                setSelectedTemplate(template);
              }}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-700 focus:border-gray-500 focus:outline-none"
            >
              <option value="">Chọn mẫu mockup...</option>
              {templates.map((template) => (
                <option key={template.template_id} value={template.template_id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
          </div>

          {/* Template Preview */}
          {selectedTemplate?.thumbnail_url && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Xem Trước</p>
              <img
                src={selectedTemplate.thumbnail_url}
                alt={selectedTemplate.name}
                className="w-full h-auto border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {/* Design URL Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Hình ảnh Thiết Kế
            </label>
            <input
              type="text"
              placeholder="https://your-cdn.com/design.png"
              value={designUrl}
              onChange={(e) => setDesignUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:border-gray-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nhập URL hình ảnh thiết kế có thể truy cập công khai
            </p>
          </div>

          {/* Design Preview */}
          {designUrl && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Xem Trước Thiết Kế</p>
              <img
                src={designUrl}
                alt="Design"
                className="w-full h-48 object-cover border border-gray-300 rounded-lg"
                onError={() => setError('Không thể tải hình ảnh thiết kế')}
              />
            </div>
          )}

          {/* Color Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Màu (ţùy chọn)
            </label>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
            />
          </div>

          {/* Render Button */}
          <button
            onClick={handleRender}
            disabled={rendering || !selectedTemplate || !designUrl}
            className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50 font-medium transition"
          >
            {rendering ? 'Đang Kết Xuất Mockup...' : 'Tạo Mockup'}
          </button>
        </div>

        {/* Right Panel - Result & History */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Kết Quả</h2>

          {mockupUrl ? (
            <div className="space-y-3">
              <img
                src={mockupUrl}
                alt="Generated Mockup"
                className="w-full border border-gray-300 rounded-lg"
              />
              <a
                href={mockupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-gray-700 text-white py-2 rounded hover:bg-gray-800 font-medium transition"
              >
                Tải Mockup
              </a>
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Mockup sẽ xuất hiện ở đây</p>
            </div>
          )}

          {/* Render History */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={fetchRenderHistory}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 mb-3"
            >
              {showHistory ? 'Ẩn' : 'Hiển Thị'} Renders Gần Đây
            </button>

            {showHistory && (
              <div className="space-y-2">
                {renderHistory.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có renders nào</p>
                ) : (
                  renderHistory.map((render) => (
                    <div
                      key={render.render_id}
                      className="border border-gray-200 rounded p-2 flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {render.mockup_templates?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(render.created_at).toLocaleDateString()}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          render.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : render.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {render.status}
                        </span>
                      </div>
                      {render.rendered_image_url && (
                        <a
                          href={render.rendered_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                        >
                          View
                        </a>
                      )}
                      <button
                        onClick={() =>
                          handleDeleteRender(render.render_id)
                        }
                        className="text-xs text-red-600 hover:text-red-800 ml-2"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
