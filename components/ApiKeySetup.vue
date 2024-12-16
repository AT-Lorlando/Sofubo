<template>
  <div>
    <input v-model="apiKey" type="text" placeholder="Entrez l'API Key" />
    <button @click="saveApiKey">Enregistrer</button>
  </div>
</template>

<script setup>
import { setApiKey, getApiKey } from "~/utils/storage";

const apiKey = ref("");

onMounted(async () => {
  apiKey.value = (await getApiKey()) || "";
});

async function saveApiKey() {
  await setApiKey(apiKey.value);
  alert("API Key enregistrée avec succès.");
}
</script>

<style scoped>
input {
  width: calc(100% - 120px);
  margin-right: 10px;
}
button {
  padding: 5px 10px;
}
</style>
