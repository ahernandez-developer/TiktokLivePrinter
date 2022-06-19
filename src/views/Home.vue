<template>
  <div class="home">
    <v-row class="pt-4" justify="center">
      <v-btn color="primary" @click="testDbConnection"
        >Test db connection</v-btn
      >
    </v-row>
    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "./components/HelloWorld";
import { dispatch } from "../api.js";
export default {
  name: "Home",
  components: {
    HelloWorld,
  },
  methods: {
    async testDbConnection() {
      let route = {
        controller: "login",
        action: "db",
        params: {
          msg: "hello world",
        },
      };

      const response = await dispatch(route, (response) => {
        console.log("callback response");
        console.log(response);
      });
    },
  },
};
</script>
