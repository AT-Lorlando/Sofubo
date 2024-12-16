<template>
  <div>
    <button @click="capturePhoto">Prendre une photo</button>
    <button @click="uploadPhoto">Importer une photo</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Camera, CameraResultType } from "@capacitor/camera";
import { getApiKey } from "~/utils/storage";
const { $axios } = useNuxtApp();

const photo = ref(null);

async function capturePhoto() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Base64,
  });
  photo.value = `data:image/jpeg;base64,${image.base64String}`;
}

async function uploadPhoto() {
  if (!photo.value) return alert("Prends une photo d'abord");

  try {
    await $axios.post(
      "/api/stories",
      {
        image: photo.value,
      },
      {
        headers: {
          "x-api-key": await getApiKey(),
        },
      }
    );
    alert("Story envoyée avec succès");
  } catch (error) {
    console.error(error);
    alert("Erreur lors de l'envoi");
  }
}
</script>
