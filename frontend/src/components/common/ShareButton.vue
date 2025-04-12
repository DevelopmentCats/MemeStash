<template>
  <div class="share-button-container">
    <!-- Main share button -->
    <button 
      class="share-button" 
      @click="showShareOptions = !showShareOptions"
      :aria-expanded="showShareOptions"
      aria-haspopup="true"
    >
      <span class="share-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </span>
      <span class="share-text">{{ buttonText }}</span>
    </button>

    <!-- Share options dropdown -->
    <div v-if="showShareOptions" class="share-options" ref="shareOptions">
      <div class="share-options-header">
        <h3>Share this meme</h3>
        <button class="close-button" @click="showShareOptions = false" aria-label="Close share options">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Native sharing option (if available) -->
      <button 
        v-if="isWebShareSupported" 
        class="share-option-button native-share"
        @click="shareNative"
      >
        <span class="share-option-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </span>
        <span>Share via device</span>
      </button>

      <!-- Copy link option -->
      <button 
        class="share-option-button copy-link"
        @click="copyLink"
      >
        <span class="share-option-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </span>
        <span>Copy link</span>
      </button>

      <!-- QR Code option -->
      <button 
        class="share-option-button qr-code"
        @click="showQRCode"
      >
        <span class="share-option-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </span>
        <span>Show QR Code</span>
      </button>

      <!-- Social media sharing options -->
      <div class="social-share-options">
        <button 
          v-for="platform in socialPlatforms" 
          :key="platform.id"
          class="share-option-button social-share"
          :class="platform.id"
          @click="shareToSocialMedia(platform.id)"
        >
          <span class="share-option-icon" v-html="platform.icon"></span>
          <span>{{ platform.name }}</span>
        </button>
      </div>

      <!-- Advanced sharing options -->
      <div class="advanced-share-options" v-if="showAdvancedOptions">
        <h4>Advanced Options</h4>
        
        <!-- Expiring link option -->
        <div class="expiring-link-option">
          <label>
            <input type="checkbox" v-model="isTemporary" />
            Create expiring link
          </label>
          <div v-if="isTemporary" class="expiration-selector">
            <select v-model="expiresIn">
              <option value="3600">1 hour</option>
              <option value="86400">24 hours</option>
              <option value="604800">7 days</option>
              <option value="2592000">30 days</option>
            </select>
          </div>
        </div>
        
        <!-- Privacy option -->
        <div class="privacy-option">
          <label>
            <input type="checkbox" v-model="isPublic" />
            Public link (anyone can view)
          </label>
        </div>
        
        <button 
          class="generate-link-button"
          @click="generateShareableLink"
        >
          Generate Link
        </button>
      </div>

      <!-- Toggle advanced options -->
      <button 
        class="toggle-advanced-button"
        @click="showAdvancedOptions = !showAdvancedOptions"
      >
        {{ showAdvancedOptions ? 'Hide advanced options' : 'Show advanced options' }}
      </button>
    </div>

    <!-- QR Code Modal -->
    <div v-if="showQRCodeModal" class="qr-code-modal">
      <div class="qr-code-container">
        <div class="qr-code-header">
          <h3>Scan QR Code to share</h3>
          <button class="close-button" @click="showQRCodeModal = false" aria-label="Close QR code">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="qr-code-image">
          <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="QR Code for sharing" />
          <div v-else class="qr-code-loading">Generating QR Code...</div>
        </div>
        <div class="qr-code-actions">
          <button class="download-qr-button" @click="downloadQRCode">
            Download QR Code
          </button>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="notification" class="share-notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import SharingService from '@/services/sharing.service';
import QRCodeService from '@/services/qrcode.service';

export default {
  name: 'ShareButton',
  props: {
    meme: {
      type: Object,
      required: true
    },
    buttonText: {
      type: String,
      default: 'Share'
    },
    buttonSize: {
      type: String,
      default: 'medium', // small, medium, large
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
  },
  setup(props) {
    // State
    const showShareOptions = ref(false);
    const showAdvancedOptions = ref(false);
    const showQRCodeModal = ref(false);
    const qrCodeDataUrl = ref(null);
    const notification = ref(null);
    const isTemporary = ref(false);
    const expiresIn = ref(86400); // 24 hours in seconds
    const isPublic = ref(true);
    const shareOptions = ref(null);

    // Computed properties
    const isWebShareSupported = computed(() => {
      return SharingService.isWebShareSupported();
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
      }
    ]);

    // Methods
    const shareNative = async () => {
      try {
        const shareData = {
          title: props.meme.title,
          text: props.meme.description || 'Check out this meme!',
          url: `${window.location.origin}/meme/${props.meme.id}`
        };
        
        const result = await SharingService.share(shareData);
        
        if (result.success) {
          showNotification('Shared successfully!', 'success');
          showShareOptions.value = false;
        } else {
          showNotification('Sharing failed. Please try another method.', 'error');
        }
      } catch (error) {
        console.error('Error sharing:', error);
        showNotification('Sharing failed. Please try another method.', 'error');
      }
    };

    const copyLink = async () => {
      try {
        const url = `${window.location.origin}/meme/${props.meme.id}`;
        const result = await SharingService.copyToClipboard(url);
        
        if (result.success) {
          showNotification('Link copied to clipboard!', 'success');
          showShareOptions.value = false;
        } else {
          showNotification('Failed to copy link. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Error copying link:', error);
        showNotification('Failed to copy link. Please try again.', 'error');
      }
    };

    const showQRCode = async () => {
      try {
        showQRCodeModal.value = true;
        qrCodeDataUrl.value = null; // Reset while loading
        
        // Generate QR code
        qrCodeDataUrl.value = await QRCodeService.generateMemeQRCode(props.meme);
      } catch (error) {
        console.error('Error generating QR code:', error);
        showNotification('Failed to generate QR code. Please try again.', 'error');
        showQRCodeModal.value = false;
      }
    };

    const downloadQRCode = () => {
      if (qrCodeDataUrl.value) {
        QRCodeService.downloadQRCode(qrCodeDataUrl.value, `meme-${props.meme.id}-qrcode.png`);
      }
    };

    const shareToSocialMedia = (platform) => {
      try {
        const shareData = {
          title: props.meme.title,
          text: props.meme.description || 'Check out this meme!',
          url: `${window.location.origin}/meme/${props.meme.id}`
        };
        
        SharingService.shareToSocialMedia(platform, shareData);
        showShareOptions.value = false;
      } catch (error) {
        console.error(`Error sharing to ${platform}:`, error);
        showNotification(`Failed to share to ${platform}. Please try again.`, 'error');
      }
    };

    const generateShareableLink = async () => {
      try {
        const options = {
          isTemporary: isTemporary.value,
          expiresIn: isTemporary.value ? parseInt(expiresIn.value) : undefined,
          isPublic: isPublic.value
        };
        
        const result = await SharingService.generateShareableLink(props.meme.id, options);
        
        if (result && result.shareUrl) {
          await SharingService.copyToClipboard(result.shareUrl);
          showNotification('Custom link generated and copied to clipboard!', 'success');
          showShareOptions.value = false;
        } else {
          showNotification('Failed to generate link. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Error generating shareable link:', error);
        showNotification('Failed to generate link. Please try again.', 'error');
      }
    };

    const showNotification = (message, type = 'info') => {
      notification.value = { message, type };
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        notification.value = null;
      }, 3000);
    };

    // Handle clicks outside the share options
    const handleClickOutside = (event) => {
      if (shareOptions.value && !shareOptions.value.contains(event.target) && showShareOptions.value) {
        showShareOptions.value = false;
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      showShareOptions,
      showAdvancedOptions,
      showQRCodeModal,
      qrCodeDataUrl,
      notification,
      isTemporary,
      expiresIn,
      isPublic,
      isWebShareSupported,
      socialPlatforms,
      shareOptions,
      shareNative,
      copyLink,
      showQRCode,
      downloadQRCode,
      shareToSocialMedia,
      generateShareableLink
    };
  }
};
</script>

<style scoped>
.share-button-container {
  position: relative;
  display: inline-block;
}

.share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.share-button:hover {
  background-color: #3a80d2;
}

.share-options {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 280px;
  z-index: 100;
  overflow: hidden;
}

.share-options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.share-options-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
}

.share-option-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
}

.share-option-button:hover {
  background-color: #f5f5f5;
}

.share-option-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.social-share-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid #eee;
  margin-top: 8px;
  padding-top: 8px;
}

.advanced-share-options {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  margin-top: 8px;
}

.advanced-share-options h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
}

.expiring-link-option,
.privacy-option {
  margin-bottom: 12px;
}

.expiration-selector {
  margin-top: 8px;
  margin-left: 24px;
}

.expiration-selector select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.generate-link-button {
  width: 100%;
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 8px;
}

.toggle-advanced-button {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  border-top: 1px solid #eee;
  text-align: center;
  color: #4a90e2;
  cursor: pointer;
  font-size: 14px;
}

/* QR Code Modal */
.qr-code-modal {
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

.qr-code-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 320px;
  overflow: hidden;
}

.qr-code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.qr-code-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.qr-code-image {
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.qr-code-image img {
  max-width: 100%;
  height: auto;
}

.qr-code-loading {
  color: #666;
  font-size: 14px;
}

.qr-code-actions {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  text-align: center;
}

.download-qr-button {
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
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
  z-index: 1000;
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
  .share-options {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    margin-top: 0;
    border-radius: 8px 8px 0 0;
    max-height: 80vh;
    overflow-y: auto;
  }
}
</style>