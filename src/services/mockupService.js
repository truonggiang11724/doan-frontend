import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const mockupService = {
  /**
   * Get all available mockup templates
   * @param {boolean} isActive - Filter by active status
   * @param {number} [variantId] - Optional variant ID to filter templates
   */
  getTemplates: (isActive = true, variantId = null) => {
    const params = { active: isActive };
    if (variantId) {
      params.variant_id = variantId;
    }
    return axios.get(`${API_BASE_URL}/mockups/templates`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  /**
   * Get mockup template by ID
   */
  getTemplate: (templateId) => {
    return axios.get(`${API_BASE_URL}/mockups/templates/${templateId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  /**
   * Render mockup with design image
   * @param {Object} config - Render configuration
   * @param {number} config.template_id - Mockup template ID
   * @param {string} config.design_image_url - URL of the design image
   * @param {number} [config.product_id] - Optional product ID to link render to
   * @param {Object} [config.render_config] - Optional render configuration (colors, smart object IDs, etc)
   */
  renderMockup: (config) => {
    console.log(config);
    
    return axios.post(`${API_BASE_URL}/mockups/render`, config, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * Get render history for authenticated customer
   */
  getRenderHistory: (limit = 20) => {
    return axios.get(`${API_BASE_URL}/mockups/renders`, {
      params: { limit },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  /**
   * Get single render by ID
   */
  getRender: (renderId) => {
    return axios.get(`${API_BASE_URL}/mockups/renders/${renderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  /**
   * Delete render
   */
  deleteRender: (renderId) => {
    return axios.delete(`${API_BASE_URL}/mockups/renders/${renderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  /**
   * Upload image file for mockup
   * File should be uploaded to your storage service first, then use the URL
   * This is a helper method that could integrate with your upload endpoint
   */
  uploadDesign: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default mockupService;
