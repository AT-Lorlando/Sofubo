<template>
  <div class="story-viewer">
    <div class="background">
      <img
        v-if="stories.length > 0"
        :src="'https://sofubo.altab.tech/public/' + filename"
        alt="Story"
        class="story-background"
      />
    </div>
    <div class="story">
      <img
        v-if="stories.length > 0"
        :src="'https://sofubo.altab.tech/public/' + filename"
        class="story-image"
      />
      <p v-else>No stories available</p>
    </div>
    <div class="controls">
      <button @click="showPrevious">Précedente</button>
      <p>{{ date }}</p>
      <button @click="showPrevious">Suivante</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getApiKey } from "~/utils/storage";
const { $axios } = useNuxtApp();

const stories = ref([]);
const currentIndex = ref(0);
const filename = ref("");
const date = ref("");

watch(currentIndex, (index) => {
  if (stories.value.length > 0) {
    filename.value = stories.value[index].filename;
  }
});

watch(filename, (filename) => {
  let d = parseInt(filename.split("-")[2].split(".")[0]);
  const _date = new Date(d);
  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  if (_date.toDateString() === new Date().toDateString()) {
    // date.value = _date.toLocaleDateString("fr-FR", options);
    date.value = `Aujourd'hui à ${_date.getHours()}h`;
  } else {
    date.value = _date.toLocaleDateString("fr-FR", options);
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
* {
  font-family: "Roboto", sans-serif;
}

.story-viewer {
  position: absolute;
  inset: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.background {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
}

.story {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

img.story-background {
  max-height: 100vh;
  inset: 0;
  object-fit: cover;
  filter: blur(20px);
  opacity: 0.9;
}

.story img.story-image {
  max-width: 100vw;
  z-index: 1;
}

.controls {
  position: absolute;
  bottom: 15px;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.controls button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  width: 150px;
  margin: 0 15px;
  /* no back ground color but white border and text */
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  font-size: 1.2rem;
  border: 2px solid white;
}

.controls p {
  color: white;
  font-size: 1.5rem;
}
</style>
