<template>
  <div class="share-dialog-overlay" v-if="isVisible" @click="closeOnBackdropClick">
    <div class="share-dialog" ref="dialogRef">
      <div class="share-dialog-header">
        <h2>Share Meme</h2>
        <button class="close-button" @click="close" aria-label="Close dialog">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="share-dialog-content">
        <!-- Meme preview -->
        <div class="meme-preview">
          <img 
            v-if="meme && meme.id" 
            :src="getMemeImageUrl(meme.id)" 
            :alt="meme.title" 
            class="meme-image"
          />
          <div class="meme-info">
            <h3>{{ meme.title }}</h3>
            <p v-if="meme.description">{{ meme.description }}</p>
          </div>
        </div>

        <!-- Share URL -->
        <div class="share-url-container">
          <input 
            type="text" 
            :value="shareUrl" 
            readonly 
            class="share-url-input"
            ref="urlInput"
          />
          <button class="copy-url-button" @click="copyShareUrl">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          </button>
        </div>

        <!-- Tabs for different sharing methods -->
        <div class="share-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id" 
            class="tab-button" 
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab content -->
        <div class="tab-content">
          <!-- Social Media Tab -->
          <div v-if="activeTab === 'social'" class="social-sharing-options">
            <button 
              v-for="platform in socialPlatforms" 
              :key="platform.id"
              class="social-share-button"
              :class="platform.id"
              @click="shareToSocialMedia(platform.id)"
            >
              <span class="platform-icon" v-html="platform.icon"></span>
              <span class="platform-name">{{ platform.name }}</span>
            </button>
          </div>

          <!-- QR Code Tab -->
          <div v-if="activeTab === 'qrcode'" class="qrcode-container">
            <div class="qrcode-display">
              <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="QR Code" class="qrcode-image" />
              <div v-else class="qrcode-loading">
                Generating QR Code...
              </div>
            </div>
            <div class="qrcode-options">
              <button class="download-qrcode-button" @click="downloadQRCode" :disabled="!qrCodeDataUrl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download QR Code
              </button>
            </div>
          </div>

          <!-- Advanced Tab -->
          <div v-if="activeTab === 'advanced'" class="advanced-options">
            <div class="option-group">
              <h4>Link Privacy</h4>
              <div class="radio-option">
                <input type="radio" id="public-link" v-model="isPublic" :value="true" />
                <label for="public-link">Public link (anyone can view)</label>
              </div>
              <div class="radio-option">
                <input type="radio" id="private-link" v-model="isPublic" :value="false" />
                <label for="private-link">Private link (only you can view)</label>
              </div>
            </div>

            <div class="option-group">
              <h4>Link Expiration</h4>
              <div class="radio-option">
                <input type="radio" id="permanent-link" v-model="isTemporary" :value="false" />
                <label for="permanent-link">Permanent link</label>
              </div>
              <div class="radio-option">
                <input type="radio" id="temporary-link" v-model="isTemporary" :value="true" />
                <label for="temporary-link">Temporary link</label>
              </div>
              
              <div v-if="isTemporary" class="expiration-selector">
                <label for="expiration-time">Expires after:</label>
                <select id="expiration-time" v-model="expiresIn">
                  <option value="3600">1 hour</option>
                  <option value="86400">24 hours</option>
                  <option value="604800">7 days</option>
                  <option value="2592000">30 days</option>
                </select>
              </div>
            </div>

            <div class="option-group" v-if="isWatermarkSupported">
              <h4>Watermark</h4>
              <div class="checkbox-option">
                <input type="checkbox" id="add-watermark" v-model="addWatermark" />
                <label for="add-watermark">Add watermark to shared image</label>
              </div>
              
              <div v-if="addWatermark" class="watermark-options">
                <div class="watermark-position">
                  <label for="watermark-position">Position:</label>
                  <select id="watermark-position" v-model="watermarkPosition">
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                <div class="watermark-opacity">
                  <label for="watermark-opacity">Opacity: {{ watermarkOpacity }}%</label>
                  <input 
                    type="range" 
                    id="watermark-opacity" 
                    v-model="watermarkOpacity" 
                    min="10" 
                    max="100" 
                    step="5"
                  />
                </div>
              </div>
            </div>

            <button class="generate-link-button" @click="generateCustomLink">
              Generate Custom Link
            </button>
          </div>

          <!-- Native Tab -->
          <div v-if="activeTab === 'native'" class="native-sharing-options">
            <div v-if="isWebShareSupported" class="native-share-info">
              <p>Share this meme using your device's native sharing capabilities.</p>
              <button class="native-share-button" @click="shareNative">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                Share via Device
              </button>
            </div>
            <div v-else class="native-share-unsupported">
              <p>Native sharing is not supported on your device or browser.</p>
              <p>Please use one of the other sharing methods.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="share-dialog-footer">
        <button class="cancel-button" @click="close">Cancel</button>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="notification" class="share-notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import SharingService from '@/services/sharing.service';
import QRCodeService from '@/services/qrcode.service';

export default {
  name: 'ShareDialog',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    meme: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'share-success', 'share-error'],
  setup(props, { emit }) {
    // State
    const dialogRef = ref(null);
    const urlInput = ref(null);
    const activeTab = ref('social');
    const qrCodeDataUrl = ref(null);
    const notification = ref(null);
    const isPublic = ref(true);
    const isTemporary = ref(false);
    const expiresIn = ref('86400');
    const addWatermark = ref(false);
    const watermarkPosition = ref('bottom-right');
    const watermarkOpacity = ref(50);
    const customShareUrl = ref('');

    // Computed properties
    const isWebShareSupported = computed(() => {
      return SharingService.isWebShareSupported();
    });

    const isWatermarkSupported = computed(() => {
      // Check if the meme is an image that can be watermarked
      return props.meme && 
             props.meme.fileType && 
             props.meme.fileType.startsWith('image/');
    });

    const shareUrl = computed(() => {
      if (customShareUrl.value) {
        return customShareUrl.value;
      }
      return `${window.location.origin}/meme/${props.meme.id}`;
    });

    const tabs = computed(() => {
      const baseTabs = [
        { id: 'social', label: 'Social Media' },
        { id: 'qrcode', label: 'QR Code' },
        { id: 'advanced', label: 'Advanced' }
      ];
      
      // Add native sharing tab if supported
      if (isWebShareSupported.value) {
        baseTabs.unshift({ id: 'native', label: 'Share' });
      }
      
      return baseTabs;
    });

    const socialPlatforms = computed(() => [
      {
        id: 'facebook',
        name: 'Facebook',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>'
      },
      {
        id: 'twitter',
        name: 'X / Twitter',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/></svg>'
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 21.5h-5v-13h5v13zM4 6.5C2.5 6.5 1.5 5.3 1.5 4s1-2.4 2.5-2.4c1.6 0 2.5 1 2.6 2.5 0 1.4-1 2.5-2.6 2.5zm11.5 6c-1 0-2 1-2 2v7h-5v-13h5V10s1.6-1.5 4-1.5c3 0 5 2.2 5 6.3v6.7h-5v-7c0-1-1-2-2-2z"/></svg>'
      },
      {
        id: 'reddit',
        name: 'Reddit',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.75-1.64-6.07-1.72.08-1.1.4-3.05 1.52-3.7.72-.4 1.73-.24 3 .5C17.2 6.3 18.46 7.5 20 7.5c1.65 0 3-1.35 3-3s-1.35-3-3-3c-1.38 0-2.54.94-2.88 2.22-1.43-.72-2.64-.8-3.6-.25-1.64.94-1.95 3.47-2 4.55-2.33.08-4.45.7-6.1 1.72C4.86 8.98 3.96 8.5 3 8.5c-1.65 0-3 1.35-3 3 0 1.32.84 2.44 2.05 2.84-.03.22-.05.44-.05.66 0 3.86 4.5 7 10 7s10-3.14 10-7c0-.22-.02-.44-.05-.66 1.2-.4 2.05-1.54 2.05-2.84zM2.3 13.37C1.5 13.07 1 12.35 1 11.5c0-1.1.9-2 2-2 .64 0 1.22.32 1.6.82-1.1.85-1.92 1.9-2.3 3.05zm3.7.13c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9.8 4.8c-1.08.63-2.42.96-3.8.96-1.4 0-2.74-.34-3.8-.95-.24-.13-.32-.44-.2-.68.15-.24.46-.32.7-.18 1.83 1.06 4.76 1.06 6.6 0 .23-.13.53-.05.67.2.14.23.06.54-.18.67zm.2-2.8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm5.7-2.13c-.38-1.16-1.2-2.2-2.3-3.05.38-.5.97-.82 1.6-.82 1.1 0 2 .9 2 2 0 .84-.53 1.57-1.3 1.87z"/></svg>'
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375c-.99-1.576-1.516-3.391-1.516-5.26 0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411"/></svg>'
      },
      {
        id: 'telegram',
        name: 'Telegram',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>'
      },
      {
        id: 'pinterest',
        name: 'Pinterest',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>'
      }
    ]);

    // Methods
    const close = () => {
      emit('close');
    };

    const closeOnBackdropClick = (event) => {
      if (dialogRef.value && !dialogRef.value.contains(event.target)) {
        close();
      }
    };

    const getMemeImageUrl = (memeId) => {
      return `/api/memes/${memeId}/file`;
    };

    const copyShareUrl = async () => {
      try {
        await SharingService.copyToClipboard(shareUrl.value);
        showNotification('Link copied to clipboard!', 'success');
        
        // Select the text for visual feedback
        if (urlInput.value) {
          urlInput.value.select();
        }
      } catch (error) {
        console.error('Error copying URL:', error);
        showNotification('Failed to copy link', 'error');
      }
    };

    const shareToSocialMedia = (platform) => {
      try {
        const shareData = {
          title: props.meme.title,
          text: props.meme.description || 'Check out this meme!',
          url: shareUrl.value
        };
        
        SharingService.shareToSocialMedia(platform, shareData);
        emit('share-success', { method: platform });
      } catch (error) {
        console.error(`Error sharing to ${platform}:`, error);
        showNotification(`Failed to share to ${platform}`, 'error');
        emit('share-error', { method: platform, error });
      }
    };

    const shareNative = async () => {
      try {
        const shareData = {
          title: props.meme.title,
          text: props.meme.description || 'Check out this meme!',
          url: shareUrl.value
        };
        
        const result = await SharingService.share(shareData);
        
        if (result.success) {
          showNotification('Shared successfully!', 'success');
          emit('share-success', { method: 'native' });
        } else {
          throw new Error(result.error || 'Sharing failed');
        }
      } catch (error) {
        console.error('Error sharing:', error);
        showNotification('Sharing failed', 'error');
        emit('share-error', { method: 'native', error });
      }
    };

    const downloadQRCode = () => {
      if (qrCodeDataUrl.value) {
        QRCodeService.downloadQRCode(qrCodeDataUrl.value, `meme-${props.meme.id}-qrcode.png`);
      }
    };

    const generateCustomLink = async () => {
      try {
        const options = {
          isTemporary: isTemporary.value,
          expiresIn: isTemporary.value ? parseInt(expiresIn.value) : undefined,
          isPublic: isPublic.value,
          watermark: addWatermark.value ? {
            position: watermarkPosition.value,
            opacity: watermarkOpacity.value
          } : undefined
        };
        
        const result = await SharingService.generateShareableLink(props.meme.id, options);
        
        if (result && result.shareUrl) {
          customShareUrl.value = result.shareUrl;
          showNotification('Custom link generated!', 'success');
          
          // Switch to the social tab to show sharing options
          activeTab.value = 'social';
          
          // Select the URL for easy copying
          setTimeout(() => {
            if (urlInput.value) {
              urlInput.value.select();
            }
          }, 100);
        } else {
          throw new Error('Failed to generate link');
        }
      } catch (error) {
        console.error('Error generating custom link:', error);
        showNotification('Failed to generate custom link', 'error');
      }
    };

    const showNotification = (message, type = 'info') => {
      notification.value = { message, type };
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        notification.value = null;
      }, 3000);
    };

    // Generate QR code when tab changes to QR code or when the share URL changes
    watch([() => activeTab.value, () => shareUrl.value], async ([newTab, newUrl]) => {
      if (newTab === 'qrcode') {
        try {
          qrCodeDataUrl.value = null; // Reset while loading
          qrCodeDataUrl.value = await QRCodeService.generateQRCodeDataURL(shareUrl.value);
        } catch (error) {
          console.error('Error generating QR code:', error);
          showNotification('Failed to generate QR code', 'error');
        }
      }
    });

    // Reset custom URL when dialog is opened
    watch(() => props.isVisible, (isVisible) => {
      if (isVisible) {
        customShareUrl.value = '';
        activeTab.value = 'social';
      }
    });

    // Focus URL input when dialog is opened
    onMounted(() => {
      if (props.isVisible && urlInput.value) {
        setTimeout(() => {
          urlInput.value.select();
        }, 100);
      }
    });

    return {
      dialogRef,
      urlInput,
      activeTab,
      qrCodeDataUrl,
      notification,
      isPublic,
      isTemporary,
      expiresIn,
      addWatermark,
      watermarkPosition,
      watermarkOpacity,
      isWebShareSupported,
      isWatermarkSupported,
      shareUrl,
      tabs,
      socialPlatforms,
      close,
      closeOnBackdropClick,
      getMemeImageUrl,
      copyShareUrl,
      shareToSocialMedia,
      shareNative,
      downloadQRCode,
      generateCustomLink
    };
  }
};
</script>

<style scoped>
.share-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.share-dialog {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.share-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.share-dialog-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
}

.share-dialog-content {
  padding: 20px;
  flex: 1;
}

.meme-preview {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.meme-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
}

.meme-info {
  flex: 1;
}

.meme-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.meme-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.share-url-container {
  display: flex;
  margin-bottom: 20px;
}

.share-url-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
}

.copy-url-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.share-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.tab-button {
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.tab-button.active {
  color: #4a90e2;
  border-bottom-color: #4a90e2;
}

.tab-content {
  min-height: 200px;
}

.social-sharing-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.social-share-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.social-share-button:hover {
  background-color: #f5f5f5;
}

.platform-icon {
  margin-bottom: 8px;
  color: #333;
}

.platform-name {
  font-size: 12px;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-display {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.qrcode-image {
  max-width: 100%;
  max-height: 100%;
}

.qrcode-loading {
  color: #666;
}

.download-qrcode-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.download-qrcode-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.advanced-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-group {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 16px;
}

.option-group h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
}

.radio-option,
.checkbox-option {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.radio-option input,
.checkbox-option input {
  margin-right: 8px;
}

.expiration-selector {
  margin-top: 8px;
  margin-left: 24px;
}

.expiration-selector label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
}

.expiration-selector select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.watermark-options {
  margin-top: 8px;
  margin-left: 24px;
}

.watermark-position,
.watermark-opacity {
  margin-bottom: 8px;
}

.watermark-position label,
.watermark-opacity label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
}

.watermark-position select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.watermark-opacity input {
  width: 100%;
}

.generate-link-button {
  padding: 10px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 8px;
}

.native-sharing-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.native-share-info p {
  margin-bottom: 20px;
  color: #666;
}

.native-share-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.native-share-unsupported {
  color: #666;
}

.share-dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.cancel-button {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Notification */
.share-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  z-index: 1100;
  animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
}

.share-notification.success {
  background-color: #4caf50;
}

.share-notification.error {
  background-color: #f44336;
}

.share-notification.info {
  background-color: #2196f3;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Responsive styles */
@media (max-width: 480px) {
  .social-sharing-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .share-dialog {
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: none;
    border-radius: 0;
  }
}
</style>