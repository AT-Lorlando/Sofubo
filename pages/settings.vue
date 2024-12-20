<template>
  <div class="settings-page">
    <h1>Settings</h1>

    <section>
      <h2>Configurer l'API Key</h2>
      <ApiKeySetup />
    </section>

    <section>
      <h2>Gestion des Photos</h2>
      <div class="buttons">
        <StoryUploader />
        <StoryManage />
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings-page {
  background-color: #151931; /* Blue-black background */
  color: white; /* White text */
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
}

h1,
h2 {
  margin: 0 0 20px 0;
}

section {
  margin-bottom: 40px;
}

h1 {
  font-size: 2.5em;
}

h2 {
  font-size: 2em;
}

.buttons {
  display: flex;
  gap: 20px;
  flex-direction: column;
  width: 50%;
}

.buttons div {
  display: flex;
  gap: 20px;
  flex-direction: column;
}
</style>

<style>
button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: 2px solid white;
  background: transparent;
  color: white;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  border-radius: 5px;
}

button:hover {
  background: white;
  color: #151931;
}
</style>
