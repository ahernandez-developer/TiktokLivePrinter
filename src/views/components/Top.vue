<template>
  <div>
    <v-row class="mb-4" justify="center">
      <v-col class="text-center">
        <h3>TOP GANADORES</h3>
        <v-divider class="mx-15"></v-divider>
        <h3></h3>
      </v-col>
    </v-row>
   
    <!-- Desktop version -->
 

    <v-row class="mt-13">
      <v-col id="canvas">
        <v-card v-if="users.length > 0" outlined height="500">
          <v-list three-line v-if="users.length > 0" height="500">
            <template v-for="(item, index) in subTop">
              <ProfileCard                
                :nameInitial="item.nickname.toUpperCase().charAt(0)"
                :name="item.nickname"                
                :kaizens="item.win"
                :top="index + 1"
              />
              <v-divider
                :key="index"
                v-if="index < subTop.length - 1"
              ></v-divider>
            </template>
          </v-list>
        </v-card>
        <v-skeleton-loader
          v-else
          min-height="408"
          height="408"
          type="image,image"
        ></v-skeleton-loader>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ProfileCard from "./ProfileCard.vue";
import moment from "moment";
export default {
  components: { ProfileCard },
  props: {
    users: {
      type: Array,
      required: true,
    },
  },
  created() {},
  computed: {
    subTop() {
      return this.users;
    },
  },
  methods: {
    safeNavigation(user) {
      if (user) return user.uniqueId;
      else return "";
    },
   
  },
};
</script>

<style scoped>
.v-list {
  overflow-y: hidden;
}
.v-list:hover {
  overflow-y: scroll;
}
.zoom {
  transition: transform 0.2s; /* Animation */
}

.zoom:hover {
  transform: scale(
    1.05
  ); /* (150% zoom - Note: if the zoom is too large, it will go outside of the viewport) */
}
</style>