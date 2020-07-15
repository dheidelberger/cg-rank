<template>
  <v-app>
    <v-app-bar app dark>
      <v-avatar :tile="true">
        <v-img :src="require('@/assets/cgrank_icon_white.png')" />
      </v-avatar>
      <v-toolbar-title class="accent--text ml-4">CG Rank</v-toolbar-title>
      <v-spacer></v-spacer>
      <router-link to="/" class="route" exact>
        <v-btn text color="accent--text">Home</v-btn>
      </router-link>
      <router-link to="/playground" class="route" exact>
        <v-btn text color="accent--text">Playground</v-btn>
      </router-link>
      <router-link class="route" to="/about">
        <v-btn text color="accent--text">About</v-btn>
      </router-link>
    </v-app-bar>

    <v-main>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </v-main>
  </v-app>
</template>

<script>
const axios = require("axios");
export default {
  name: "App",

  data: () => ({
    //
  }),
  async mounted() {
    try {
      const response = await axios.get(`.netlify/functions/get-score`, {
        timeout: 13000,
        params: {
          profile: "typingm"
        }
      });

      let cgRank = `${response.data.ranking.codingame.rank.toLocaleString()}/${response.data.ranking.codingame.totalPlayers.toLocaleString()}`;
      let cocRank = `${response.data.ranking.clashOfCode.rank.toLocaleString()}/${response.data.ranking.clashOfCode.totalPlayers.toLocaleString()}`;

      this.$store.commit("addDavidScore", { cgRank, cocRank, loaded: true });
    } catch (error) {
      console.log("Errored");
      console.error(error);
      let cgRank = "Error loading Codingame rank";
      let cocRank = "Error loading Clash of Code rank";
      this.$store.commit("addDavidScore", { cgRank, cocRank, loaded: false });
    }
  }
};
</script>
<style scoped>
.route {
  text-decoration: none;
}
.router-link-exact-active > button {
  /* background-color: #404040; */
  /* background-color: #ff0000; */

  color: #ffc107;
  font-weight: bold;
}
</style>
