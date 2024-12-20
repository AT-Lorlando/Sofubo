<template>
  <div class="main">
    <transition name="slide-down">
      <div class="container" v-if="showHeader">
        <!-- <div class="container"> -->
        <nuxt-link to="/" class="home-button">
          <icon-home
            width="24"
            height="24"
            strokeColor="white"
            fillColor="white"
          />
        </nuxt-link>
        <nuxt-link to="/settings" class="settings-button">
          <icon-settings
            width="24"
            height="24"
            strokeColor="white"
            fillColor="white"
          />
        </nuxt-link>
      </div>
    </transition>
    <slot />
  </div>
</template>

<script setup lang="ts">
const showHeader = ref(false);
const timeout = ref() as Ref<NodeJS.Timeout>;

function showHeaderForFiveSeconds() {
  showHeader.value = true;
  clearTimeout(timeout.value);
  timeout.value = setTimeout(() => {
    showHeader.value = false;
  }, 3000);
}

onMounted(() => {
  window.addEventListener("click", showHeaderForFiveSeconds);
});
</script>

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
  z-index: 1000;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.5s ease-in-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}

.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
}
</style>
