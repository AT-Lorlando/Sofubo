<template>
  <div>
    <div class="container">
      <nuxt-link to="/settings" class="settings-button">⚙️</nuxt-link>
      <nuxt-link to="/" class="home-button">🏠</nuxt-link>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(6, 0, 15, 0.8);
  z-index: 1000;
}
</style>
