/**
 * Get proper image URL from different image formats
 * @param {Object|String} image - Image object or string
 * @param {String} fallback - Fallback image URL
 * @returns {String} Proper image URL
 */
export const getImageUrl = (image, fallback = "https://via.placeholder.com/1200x400?text=No+Image") => {
  // If no image, return fallback
  if (!image) return fallback;

  // If image is an object (like your API response)
  if (typeof image === 'object') {
    // Check for signedUrl first (most up-to-date)
    if (image.signedUrl) return image.signedUrl;
    // Then check for regular url
    if (image.url) return image.url;
    // Then check for key (S3 key)
    if (image.key) {
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_IMAGE_URL || "http://localhost:8000";
      return `${BASE_URL}/${image.key}`;
    }
  }

  // If image is a string
  if (typeof image === 'string') {
    // If it's already a full URL
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    // If it's a relative path
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_IMAGE_URL || "http://localhost:8000";
    const cleanPath = image.startsWith('/') ? image : `/${image}`;
    return `${BASE_URL}${cleanPath}`;
  }

  return fallback;
};

/**
 * Get product image URL
 */
export const getProductImageUrl = (product, index = 0) => {
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return getImageUrl(product.images[index]);
  }
  if (product.image) {
    return getImageUrl(product.image);
  }
  return getImageUrl(null);
};

/**
 * Get category image URL
 */
export const getCategoryImageUrl = (category) => {
  if (category.image) {
    return getImageUrl(category.image);
  }
  return getImageUrl(null, "https://via.placeholder.com/400x300?text=Category");
};