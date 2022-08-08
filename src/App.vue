<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue';
import Navigator from './components/Navigator.vue'
import { useSettingsStore } from './stores/settings';

const settings = useSettingsStore();

onBeforeMount(async () => {
  await settings.loadSettings();
})

</script>
<template>
  <Navigator />
  
</template>

<style>

.el-notification__content {
  text-align: unset;
}

html {
  height:100%;
  --amt-font-family: Avenir, Helvetica, Arial, sans-serif;
}

body {
  font-family: var(--amt-font-family);
}
#app {
  font-family: var(--amt-font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
