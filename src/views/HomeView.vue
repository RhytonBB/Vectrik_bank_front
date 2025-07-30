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
.home {
  text-align: center;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

img {
  max-width: 300px;
  height: auto;
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.05);
}

@media (max-width: 600px) {
  .home {
    width: 100vw !important;
    padding: 16px 4vw !important;
    box-sizing: border-box;
    text-align: center;
  }
  
  img {
    max-width: 80vw !important;
    height: auto !important;
    margin-bottom: 16px !important;
    border-radius: 10px !important;
  }
}
</style>
