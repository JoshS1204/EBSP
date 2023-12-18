<script>
import { RouterLink, RouterView } from 'vue-router'
import Notification from '@/components/common/AppNotification.vue';
import Loader from "./components/common/Loader.vue";

export default {
  name: "App",
  components: {
    Notification,
    Loader
  },
  computed: {
    isloading() {
      return this.$store.state.loader.status;
    },

  },
};
</script>

<template>
  <Notification />
  <router-view />
  <Loader v-if='isloading' />
</template>

<style lang='scss'>
@import "./assets/scss/utilities/variables";
@import "./assets/scss/utilities/base";
@import "@progress/kendo-theme-bootstrap/dist/all.scss";
@import "bootstrap/scss/bootstrap.scss";
@import "./assets/scss/app.scss";
</style>