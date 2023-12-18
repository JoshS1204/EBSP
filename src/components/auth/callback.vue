<template>
  <div></div>
</template>

<script>
import { auth } from '@/services/auth-service';


export default {
  components: {

  },
  data() {

  },
  methods: {

    handleCallback() {
      let t = this;
      auth.getManager().signinRedirectCallback()
        .then(
          function () {
            t.$router.replace({ path: '/' });
          });
    }

  },
  mounted() {
    this.handleCallback();
  }

};
</script>

<style></style>