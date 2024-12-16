<template>
  <div>
    <div v-for="(story, index) in stories" :key="index" class="story">
      <img
        :src="'https://sofubo.altab.tech/public/' + story.filename"
        alt="Story"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
const { $axios } = useNuxtApp();

const api_key = "";
const stories = ref([]);

async function fetchStories() {
  try {
    const response = await $axios.get("/api/stories", {
      headers: {
        "x-api-key": api_key,
      },
    });
    stories.value = response.data.slice(0, 10); // Prend les 10 dernières
    console.log(stories.value);
  } catch (error) {
    console.error(error);
    alert("Erreur de chargement des stories");
  }
}

onMounted(fetchStories);
</script>

<style>
.story img {
  width: 100%;
  height: auto;
}
</style>
