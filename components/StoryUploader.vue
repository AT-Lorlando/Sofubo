<template>
  <div>
    <button @click="capturePhoto">Prendre une photo</button>
    <div class="send" v-if="photo">
      <img :src="photo" alt="Photo" />
      <button @click="uploadPhoto">Envoyer</button>
    </div>
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
  } finally {
    photo.value = null;
  }
}
</script>

<style scoped>
.send {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.send img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}
</style>
