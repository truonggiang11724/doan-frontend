class ViewedProductsService {
  constructor() {
    this.storageKey = 'viewedProducts';
    this.maxItems = 10;
  }

  // Lấy danh sách sản phẩm đã xem
  getViewedProducts() {
    try {
      const viewed = localStorage.getItem(this.storageKey);
      return viewed ? JSON.parse(viewed) : [];
    } catch (error) {
      console.error('Error getting viewed products:', error);
      return [];
    }
  }

  // Thêm sản phẩm vào danh sách đã xem
  addViewedProduct(product) {
    try {
      const viewed = this.getViewedProducts();
      const productId = product.product_id || product.id;

      // Loại bỏ sản phẩm nếu đã tồn tại
      const filtered = viewed.filter(p => (p.product_id || p.id) !== productId);

      // Thêm sản phẩm mới vào đầu danh sách
      const newViewed = [product, ...filtered].slice(0, this.maxItems);

      localStorage.setItem(this.storageKey, JSON.stringify(newViewed));
    } catch (error) {
      console.error('Error adding viewed product:', error);
    }
  }

  // Xóa sản phẩm khỏi danh sách đã xem
  removeViewedProduct(productId) {
    try {
      const viewed = this.getViewedProducts();
      const filtered = viewed.filter(p => (p.product_id || p.id) !== productId);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing viewed product:', error);
    }
  }

  // Xóa tất cả sản phẩm đã xem
  clearViewedProducts() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing viewed products:', error);
    }
  }
}

export default new ViewedProductsService();
