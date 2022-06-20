<template>
  <v-card flat light>
    <v-list-item style="cursor: poiner" >
     

      <v-list-item-content>
        <v-list-item-title >@ {{name}}</v-list-item-title>
        <v-list-item-subtitle
          class="font-weight-bold"
          v-html="'Puntos: ' + kaizens"
        ></v-list-item-subtitle>
        
      </v-list-item-content>
      <v-list-item-action>
        <v-btn fab depressed dark x-small color="secondary">
          {{ top }}
        </v-btn>
      </v-list-item-action>
    </v-list-item>
  </v-card>
</template>

<script>
import moment from "moment";
export default {
  props: {
   
    nameInitial: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    kaizens: {
      type: Number,
      required: true,
    },
    top: {
      type: Number,
      required: true,
    },
    since: {
      type: String,
      required: false,
    },
  },
  filters: {
    moment: function (date) {
      return moment(date).format("YYYY-MM-DD");
    },
  },
};
</script>

<style>
</style>