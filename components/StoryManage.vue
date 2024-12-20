<template>
  <div>
    <button @click="deleteLastPhoto">Supprimer la dernière photo</button>
    <button @click="deleteAllPhotos">Supprimer toutes les photos</button>
  </div>
</template>

<script setup>
import { useNuxtApp } from "#app";
import { getApiKey } from "~/utils/storage";

async function deleteLastPhoto() {
  const { $axios } = useNuxtApp();

  try {
    await $axios.delete("/api/stories/last", {
      headers: {
        "x-api-key": await getApiKey(),
      },
    });
    alert("Dernière photo supprimée avec succès.");
  } catch (error) {
    console.error(error);
    alert("Erreur lors de la suppression de la dernière photo.");
  }
}

async function deleteAllPhotos() {
  const { $axios } = useNuxtApp();

  try {
    await $axios.delete("/api/stories", {
      headers: {
        "x-api-key": await getApiKey(),
      },
    });
    alert("Toutes les photos ont été supprimées avec succès.");
  } catch (error) {
    console.error(error);
    alert("Erreur lors de la suppression de toutes les photos.");
  }
}
</script>

<style scoped>
button {
  color: red;
}
</style>
