<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <router-link to="/" class="logo">个人博客</router-link>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/tags" class="nav-link">标签</router-link>
          <router-link to="/editor" class="nav-link">写文章</router-link>
          <router-link to="/admin" class="nav-link">管理</router-link>
        </nav>
      </div>
    </header>
    <main class="main">
      <div class="container">
        <router-view />
      </div>
    </main>
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 个人博客. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
</script>

<style scoped>
.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #666;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #007bff;
}

.main {
  min-height: calc(100vh - 120px);
  padding: 30px 0;
}

.footer {
  background: #fff;
  padding: 20px 0;
  text-align: center;
  color: #666;
  border-top: 1px solid #eee;
}
</style>
