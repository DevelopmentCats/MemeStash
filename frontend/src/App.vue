<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <router-link to="/" class="logo-link">
          <h1 class="logo">Meme Stash</h1>
        </router-link>
        <NavMenu />
      </div>
    </header>
    <main class="app-content">
      <transition name="fade" mode="out-in">
        <router-view/>
      </transition>
    </main>
    <footer class="app-footer">
      <div class="footer-content">
        <p class="copyright">Meme Stash - Your Personal Meme Library</p>
        <p class="version">v1.0.0</p>
      </div>
    </footer>
  </div>
</template>

<script>
import NavMenu from '@/components/common/NavMenu.vue'

export default {
  components: {
    NavMenu
  }
}
</script>

<style>
:root {
  --primary-color: #42b983;
  --primary-light: rgba(66, 185, 131, 0.1);
  --primary-dark: #3aa876;
  --text-color: #2c3e50;
  --secondary-text: #6c757d;
  --bg-light: #f8f9fa;
  --bg-white: #ffffff;
  --border-color: #ced4da;
  --error-color: #dc3545;
  --success-color: #28a745;
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --hover-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f5f7f9;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: var(--bg-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-link {
  text-decoration: none;
}

.logo {
  color: var(--primary-color);
  margin: 0 0 10px 0;
  font-size: 2rem;
  font-weight: bold;
}

.app-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.app-footer {
  background-color: var(--bg-white);
  border-top: 1px solid var(--border-color);
  padding: 15px 0;
  margin-top: 50px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright, .version {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.9rem;
}

/* Global styles */
h1, h2, h3, h4, h5, h6 {
  color: var(--text-color);
  margin-top: 0;
}

button {
  cursor: pointer;
}

/* Page transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .header-content {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .logo {
    margin: 0;
  }
}
</style>