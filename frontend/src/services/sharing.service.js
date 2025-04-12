/**
 * Sharing Service
 * Handles all sharing functionality for the Meme Stash application
 */
import ApiService from './api.service';

export const SharingService = {
  /**
   * Check if Web Share API is available
   * @returns {boolean} - Whether Web Share API is supported
   */
  isWebShareSupported() {
    return navigator.share !== undefined;
  },

  /**
   * Check if specific content can be shared with Web Share API
   * @param {Object} shareData - Data to be shared
   * @returns {boolean} - Whether the content can be shared
   */
  canShare(shareData) {
    return navigator.canShare && navigator.canShare(shareData);
  },

  /**
   * Share content using Web Share API with fallback
   * @param {Object} shareData - Data to share
   * @param {string} shareData.title - Title of the content
   * @param {string} shareData.text - Description text
   * @param {string} shareData.url - URL to share
   * @param {File[]} [shareData.files] - Files to share (optional)
   * @returns {Promise} - Promise that resolves when sharing is complete
   */
  async share(shareData) {
    try {
      // Check if Web Share API is supported and can share this content
      if (this.isWebShareSupported() && this.canShare(shareData)) {
        await navigator.share(shareData);
        return { success: true, method: 'webshare' };
      } else {
        // Fallback to clipboard if only sharing URL
        if (shareData.url && !shareData.files) {
          await this.copyToClipboard(shareData.url);
          return { success: true, method: 'clipboard' };
        } else {
          throw new Error('Web Share API not supported and cannot use fallback');
        }
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Share a meme with available sharing methods
   * @param {Object} meme - Meme object to share
   * @param {File} [file] - Optional file object if sharing the actual file
   * @returns {Promise} - Promise that resolves when sharing is complete
   */
  async shareMeme(meme, file = null) {
    const shareUrl = `${window.location.origin}/meme/${meme.id}`;
    
    const shareData = {
      title: meme.title,
      text: meme.description || 'Check out this meme!',
      url: shareUrl
    };

    // Add file if provided and supported
    if (file && this.canShare({ files: [file] })) {
      shareData.files = [file];
    }

    return this.share(shareData);
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise} - Promise that resolves when copying is complete
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return { success: true };
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Unable to copy to clipboard');
        }
        
        return { success: true };
      }
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generate a shareable link for a meme
   * @param {number} memeId - ID of the meme
   * @param {Object} options - Options for the shareable link
   * @param {boolean} options.isTemporary - Whether the link should expire
   * @param {number} options.expiresIn - Expiration time in seconds
   * @returns {Promise} - Promise with the shareable link data
   */
  async generateShareableLink(memeId, options = {}) {
    try {
      const response = await ApiService.post(`/memes/${memeId}/share`, options);
      return response.data;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      throw error;
    }
  },

  /**
   * Share to a specific social media platform
   * @param {string} platform - Platform to share to (facebook, twitter, etc.)
   * @param {Object} shareData - Data to share
   * @returns {Promise} - Promise that resolves when sharing is complete
   */
  shareToSocialMedia(platform, shareData) {
    const url = encodeURIComponent(shareData.url);
    const text = encodeURIComponent(shareData.text);
    const title = encodeURIComponent(shareData.title);
    
    let shareUrl;
    
    switch (platform.toLowerCase()) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${url}&title=${title}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    // Open share URL in a new window
    const width = 550;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      shareUrl,
      `share-${platform}`,
      `width=${width},height=${height},top=${top},left=${left}`
    );
    
    return Promise.resolve({ success: true, method: platform });
  },

  /**
   * Get metadata for a meme for link previews
   * @param {Object} meme - Meme object
   * @returns {Object} - Metadata for the meme
   */
  getMemeMetadata(meme) {
    return {
      title: meme.title,
      description: meme.description || 'A meme from Meme Stash',
      imageUrl: `${ApiService.baseURL}/memes/${meme.id}/file`,
      url: `${window.location.origin}/meme/${meme.id}`
    };
  },

  /**
   * Check if the device is iOS
   * @returns {boolean} - Whether the device is iOS
   */
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  },

  /**
   * Check if the device is Android
   * @returns {boolean} - Whether the device is Android
   */
  isAndroid() {
    return /Android/.test(navigator.userAgent);
  },

  /**
   * Get available sharing methods based on platform
   * @returns {Array} - Array of available sharing methods
   */
  getAvailableSharingMethods() {
    const methods = [];
    
    // Web Share API
    if (this.isWebShareSupported()) {
      methods.push('native');
    }
    
    // Clipboard
    methods.push('clipboard');
    
    // QR Code
    methods.push('qrcode');
    
    // Social media platforms
    methods.push('facebook', 'twitter', 'linkedin', 'reddit');
    
    // Mobile-specific
    if (this.isIOS() || this.isAndroid()) {
      methods.push('whatsapp', 'telegram');
    }
    
    return methods;
  }
};

export default SharingService;