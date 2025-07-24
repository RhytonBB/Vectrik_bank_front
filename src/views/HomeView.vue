<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'HomeView',
  components: {
    HelloWorld
  }
}
</script>

<style scoped>
@media (max-width: 600px) {
  .home {
    width: 100vw !important;
    padding: 12px 4vw !important;
    box-sizing: border-box;
    text-align: center;
  }
  img {
    max-width: 90vw !important;
    height: auto !important;
  }
}
</style>
