<template>
  <!-- This component doesn't render anything visible -->
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'DeepLinkHandler',
  setup() {
    const router = useRouter();

    /**
     * Parse URL parameters for deep linking
     * @param {string} url - URL to parse
     * @returns {Object} - Parsed parameters
     */
    const parseDeepLinkParams = (url) => {
      try {
        const parsedUrl = new URL(url);
        const params = {};
        
        // Extract path segments
        const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
        
        // Handle different path patterns
        if (pathSegments.length > 0) {
          const firstSegment = pathSegments[0];
          
          // Handle meme deep links
          if (firstSegment === 'meme' && pathSegments.length > 1) {
            params.type = 'meme';
            params.id = pathSegments[1];
          }
          
          // Handle share token deep links
          else if (firstSegment === 'share' && pathSegments.length > 1) {
            params.type = 'share';
            params.token = pathSegments[1];
          }
          
          // Handle category deep links
          else if (firstSegment === 'category' && pathSegments.length > 1) {
            params.type = 'category';
            params.id = pathSegments[1];
          }
          
          // Handle tag deep links
          else if (firstSegment === 'tag' && pathSegments.length > 1) {
            params.type = 'tag';
            params.id = pathSegments[1];
          }
        }
        
        // Extract query parameters
        for (const [key, value] of parsedUrl.searchParams.entries()) {
          params[key] = value;
        }
        
        return params;
      } catch (error) {
        console.error('Error parsing deep link URL:', error);
        return {};
      }
    };

    /**
     * Handle deep link navigation
     * @param {Object} params - Deep link parameters
     */
    const handleDeepLink = (params) => {
      if (!params || !params.type) return;
      
      switch (params.type) {
        case 'meme':
          if (params.id) {
            router.push({ name: 'MemeDetail', params: { id: params.id } });
          }
          break;
          
        case 'share':
          if (params.token) {
            router.push({ name: 'SharedMeme', params: { token: params.token } });
          }
          break;
          
        case 'category':
          if (params.id) {
            router.push({ 
              name: 'Library', 
              query: { categoryId: params.id } 
            });
          }
          break;
          
        case 'tag':
          if (params.id) {
            router.push({ 
              name: 'Library', 
              query: { tagId: params.id } 
            });
          }
          break;
          
        default:
          console.warn('Unknown deep link type:', params.type);
      }
    };

    /**
     * Process initial URL for deep linking
     */
    const processInitialUrl = () => {
      const currentUrl = window.location.href;
      const params = parseDeepLinkParams(currentUrl);
      handleDeepLink(params);
    };

    /**
     * Handle universal links and app links (iOS and Android)
     * @param {Event} event - Link event
     */
    const handleUniversalLink = (event) => {
      // This would be triggered by platform-specific handlers
      if (event && event.detail && event.detail.url) {
        const params = parseDeepLinkParams(event.detail.url);
        handleDeepLink(params);
      }
    };

    /**
     * Handle Android intent
     */
    const handleAndroidIntent = () => {
      // Check if we have an intent URL in the hash
      if (window.location.hash && window.location.hash.startsWith('#Intent;')) {
        try {
          // Parse Android intent URI
          const intentUri = window.location.hash.substring(1);
          const intentParams = {};
          
          // Extract parameters from intent URI
          intentUri.split(';').forEach(param => {
            if (param && param.includes('=')) {
              const [key, value] = param.split('=');
              intentParams[key] = value;
            }
          });
          
          // Handle deep link data if present
          if (intentParams.S && intentParams.S.startsWith('.deeplink=')) {
            const deepLinkData = decodeURIComponent(intentParams.S.substring(10));
            const params = parseDeepLinkParams(deepLinkData);
            handleDeepLink(params);
            
            // Clean up the URL
            history.replaceState(null, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Error handling Android intent:', error);
        }
      }
    };

    /**
     * Setup iOS Universal Links handler
     */
    const setupIOSUniversalLinks = () => {
      // Listen for the event fired when the app is opened from a Universal Link
      document.addEventListener('universalLink', handleUniversalLink);
    };

    /**
     * Handle URL changes for SPA navigation
     */
    const handleUrlChange = () => {
      const currentUrl = window.location.href;
      const params = parseDeepLinkParams(currentUrl);
      
      // Only handle if this is a deep link pattern
      if (params.type) {
        handleDeepLink(params);
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      // Process initial URL for deep linking
      processInitialUrl();
      
      // Handle Android intents
      handleAndroidIntent();
      
      // Setup iOS Universal Links
      setupIOSUniversalLinks();
      
      // Listen for URL changes (for SPA navigation)
      window.addEventListener('popstate', handleUrlChange);
    });

    onUnmounted(() => {
      // Clean up event listeners
      document.removeEventListener('universalLink', handleUniversalLink);
      window.removeEventListener('popstate', handleUrlChange);
    });

    // This component doesn't expose any methods or data
    return {};
  }
};
</script>