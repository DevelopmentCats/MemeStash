/**
 * QR Code Service
 * Handles QR code generation for the Meme Stash application
 */

// We'll need to install the qrcode library
// npm install qrcode

import QRCode from 'qrcode';

export const QRCodeService = {
  /**
   * Generate QR code as data URL
   * @param {string} data - Data to encode in QR code
   * @param {Object} options - QR code options
   * @param {number} options.width - Width of QR code
   * @param {number} options.margin - Margin of QR code
   * @param {string} options.color - Color of QR code
   * @param {string} options.backgroundColor - Background color of QR code
   * @returns {Promise<string>} - Promise with QR code data URL
   */
  async generateQRCodeDataURL(data, options = {}) {
    try {
      const qrOptions = {
        width: options.width || 200,
        margin: options.margin || 1,
        color: {
          dark: options.color || '#000000',
          light: options.backgroundColor || '#ffffff'
        },
        errorCorrectionLevel: 'H' // High error correction for better readability
      };
      
      return await QRCode.toDataURL(data, qrOptions);
    } catch (error) {
      console.error('QR code generation error:', error);
      throw error;
    }
  },

  /**
   * Generate QR code on a canvas element
   * @param {HTMLCanvasElement} canvas - Canvas element to draw QR code on
   * @param {string} data - Data to encode in QR code
   * @param {Object} options - QR code options
   * @returns {Promise<void>} - Promise that resolves when QR code is drawn
   */
  async generateQRCodeCanvas(canvas, data, options = {}) {
    try {
      const qrOptions = {
        width: options.width || 200,
        margin: options.margin || 1,
        color: {
          dark: options.color || '#000000',
          light: options.backgroundColor || '#ffffff'
        },
        errorCorrectionLevel: 'H'
      };
      
      return await QRCode.toCanvas(canvas, data, qrOptions);
    } catch (error) {
      console.error('QR code canvas generation error:', error);
      throw error;
    }
  },

  /**
   * Generate QR code for a meme
   * @param {Object} meme - Meme object
   * @param {Object} options - QR code options
   * @returns {Promise<string>} - Promise with QR code data URL
   */
  async generateMemeQRCode(meme, options = {}) {
    const shareUrl = `${window.location.origin}/meme/${meme.id}`;
    return this.generateQRCodeDataURL(shareUrl, options);
  },

  /**
   * Generate QR code with logo in the center
   * @param {string} data - Data to encode in QR code
   * @param {string} logoUrl - URL of logo to place in center
   * @param {Object} options - QR code options
   * @returns {Promise<string>} - Promise with QR code data URL
   */
  async generateQRCodeWithLogo(data, logoUrl, options = {}) {
    try {
      // First generate the QR code
      const qrCodeDataUrl = await this.generateQRCodeDataURL(data, {
        ...options,
        margin: (options.margin || 1) + 2 // Add extra margin for logo
      });
      
      // Create canvas to combine QR code and logo
      const canvas = document.createElement('canvas');
      const size = options.width || 200;
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      
      // Draw QR code on canvas
      const qrImage = new Image();
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrCodeDataUrl;
      });
      ctx.drawImage(qrImage, 0, 0, size, size);
      
      // Draw logo in center
      const logo = new Image();
      await new Promise((resolve, reject) => {
        logo.onload = resolve;
        logo.onerror = reject;
        logo.src = logoUrl;
      });
      
      // Calculate logo size (25% of QR code)
      const logoSize = size * 0.25;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;
      
      // Create circular clipping path for logo
      ctx.save();
      ctx.beginPath();
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      // Draw logo
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      ctx.restore();
      
      // Return data URL
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('QR code with logo generation error:', error);
      throw error;
    }
  },

  /**
   * Download QR code as image
   * @param {string} dataUrl - QR code data URL
   * @param {string} filename - Filename for download
   */
  downloadQRCode(dataUrl, filename = 'meme-qrcode.png') {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default QRCodeService;