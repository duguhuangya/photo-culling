<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-inner">
        <router-link to="/" class="nav-logo">📸 PhotoCulling</router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">上传</router-link>
          <router-link to="/gallery" class="nav-link">选片</router-link>
          <router-link to="/compare" class="nav-link">对比</router-link>
          <router-link to="/export" class="nav-link">导出</router-link>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
@import '@/assets/styles/main.css';

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #1a1a1a;
  z-index: 100;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.nav-logo {
  font-size: 18px;
  font-weight: 700;
  color: #e5e5e5 !important;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: #888 !important;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #ccc !important;
  background: #1a1a1a;
}

.nav-link.router-link-active {
  color: #fff !important;
  background: #1e3a5f;
}

.main-content {
  padding-top: 60px;
  min-height: 100vh;
}
</style>
