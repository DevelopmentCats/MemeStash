<template>
  <div class="about">
    <h2>About Meme Stash</h2>
    <div class="about-content">
      <p>Meme Stash is a self-hostable Progressive Web App (PWA) that allows you to create your personal meme library.</p>
      <p>Features include:</p>
      <ul>
        <li>Store and organize your favorite memes</li>
        <li>Advanced tagging and search capabilities</li>
        <li>Offline access to your meme collection</li>
        <li>Cross-platform sharing features</li>
      </ul>
      <p>This application is built using:</p>
      <ul>
        <li>Frontend: Vue.js with PWA capabilities</li>
        <li>Backend: Node.js with Express</li>
        <li>Database: PostgreSQL with JSON support</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.about {
  padding: 20px;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
  line-height: 1.6;
}

h2 {
  margin-bottom: 20px;
}

ul {
  margin: 20px 0;
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
}
</style>