<template>
  <nav class="nav-menu">
    <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="Toggle navigation menu">
      <span class="menu-icon">☰</span>
    </button>
    
    <ul class="nav-list" :class="{ 'mobile-open': mobileMenuOpen }">
      <li class="nav-item">
        <router-link to="/" class="nav-link" exact @click="closeMobileMenu">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">Home</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/library" class="nav-link" @click="closeMobileMenu">
          <span class="nav-icon">🖼️</span>
          <span class="nav-text">Library</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/upload" class="nav-link" @click="closeMobileMenu">
          <span class="nav-icon">⬆️</span>
          <span class="nav-text">Upload</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/tags" class="nav-link" @click="closeMobileMenu">
          <span class="nav-icon">🏷️</span>
          <span class="nav-text">Tags</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/categories" class="nav-link" @click="closeMobileMenu">
          <span class="nav-icon">📁</span>
          <span class="nav-text">Categories</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/about" class="nav-link" @click="closeMobileMenu">
          <span class="nav-icon">ℹ️</span>
          <span class="nav-text">About</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'NavMenu',
  data() {
    return {
      mobileMenuOpen: false
    }
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      
      // When opening menu, add class to body to prevent scrolling
      if (this.mobileMenuOpen) {
        document.body.classList.add('menu-open');
      } else {
        document.body.classList.remove('menu-open');
      }
    },
    closeMobileMenu() {
      if (this.mobileMenuOpen) {
        this.mobileMenuOpen = false;
        document.body.classList.remove('menu-open');
      }
    }
  },
  // Close mobile menu when route changes
  watch: {
    '$route'() {
      this.closeMobileMenu();
    }
  },
  // Cleanup when component is destroyed
  beforeUnmount() {
    document.body.classList.remove('menu-open');
  }
}
</script>

<style scoped>
.nav-menu {
  width: 100%;
}

.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-color);
}

.nav-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.nav-item {
  display: inline-block;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: var(--bg-light);
}

.nav-link.router-link-exact-active,
.nav-link.router-link-active {
  color: var(--primary-color);
  font-weight: bold;
  background-color: var(--primary-light);
}

.nav-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: block;
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
  
  .nav-list {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    flex-direction: column;
    background-color: var(--bg-white);
    padding-top: 4rem;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 99;
  }
  
  .nav-list.mobile-open {
    transform: translateX(0);
  }
  
  .nav-item {
    width: 100%;
  }
  
  .nav-link {
    width: 100%;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    justify-content: flex-start;
  }
  
  .nav-icon {
    width: 1.5rem;
    text-align: center;
  }
  
  /* Prevent scrolling when menu is open */
  :global(body.menu-open) {
    overflow: hidden;
  }
}

/* Smaller mobile views */
@media (max-width: 480px) {
  .nav-link {
    padding: 1rem 0.75rem;
  }
}
</style> 