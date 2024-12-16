<template>
  <div class="story-viewer">
    <div class="story">
      <img
        v-if="stories.length > 0"
        :src="'https://sofubo.altab.tech/public/' + filename"
        alt="Story"
      />
      <p v-else>No stories available</p>
    </div>
    <button @click="showPrevious" class="nav-button prev-button">
      Previous
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getApiKey } from "~/utils/storage";
const { $axios } = useNuxtApp();

const stories = ref([]);
const currentIndex = ref(0);
const filename = ref("");

watch(currentIndex, (index) => {
  if (stories.value.length > 0) {
    filename.value = stories.value[index].filename;
  }
});

async function fetchStories() {
  try {
    const response = await $axios.get("/api/stories", {
      headers: {
        "x-api-key": await getApiKey(),
      },
    });
    stories.value = response.data.slice(0, 10);
    if (stories.value.length > 0) {
      currentIndex.value = 0;
      filename.value = stories.value[0].filename;
    }
  } catch (error) {
    alert("Erreur de chargement des stories", error);
  }
}

function showPrevious() {
  if (currentIndex.value === stories.value.length - 1) {
    currentIndex.value = 0;
  } else {
    currentIndex.value++;
  }
}

onMounted(fetchStories);
</script>

<style>
.story-viewer {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: auto;
}

.settings-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.story img {
  width: 100%;
  height: auto;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}

.prev-button {
  left: 10px;
}
</style>
