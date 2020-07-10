<template>
  <v-container>
    <v-row class="text-center" justify="center">
      <v-col class="mb-4" cols="8">
        <h1 class="display-2 font-weight-bold mb-3 amber--text accent-3">CG Rank</h1>

        <p class="subheading font-weight-regular">
          Add your current rank from
          <a
            href="https://www.codingame.com"
            target="_blank"
          >codingame.com</a>
          to your resumé or other .docx file.
        </p>
      </v-col>
    </v-row>
    <v-row class="text-center" justify="center">
      <v-col cols="8">
        <v-card>
          <v-col>
            <v-text-field
              autofocus
              clearable
              outlined
              label="Enter your codingame profile"
              v-model="profile"
              prepend-icon="mdi-account-circle"
              :rules="[rules.required]"
              validate-on-blur
            ></v-text-field>
            <v-file-input
              outlined
              label="Select your resume here (.docx only)"
              v-model="resumeFile"
              accept=".docx"
              truncate-length="45"
              validate-on-blur
            ></v-file-input>
          </v-col>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="clicked"
              color="accent"
              :loading="btnLoading"
              :disabled="profile == ''"
            >Submit</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="center" v-if="gotUser">
      <v-col cols="8">
        <v-card>
          <v-img height="200px" :src="avatar"></v-img>
          <v-card-title class="text-h4 mb-2">
            {{
            userData.name
            }}
          </v-card-title>
          <v-card-subtitle class="text-h5">
            <v-row>
              <v-col cols="12" md="5" lg="4">
                <span class="font-weight-black">Codingame Rank:</span>
              </v-col>
              <v-col cols="12" md="7" lg="8">{{ cgRank }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="5" lg="4">
                <span class="font-weight-black">Clash of Code Rank:</span>
              </v-col>
              <v-col cols="12" md="7" lg="8">
                {{
                clashRank
                }}
              </v-col>
            </v-row>
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar" timeout="10000" color="error">
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
const axios = require("axios");
import { parseDocument } from "../parseDocument";

export default {
  name: "Home",

  data: () => ({
    profile: "",
    resumeFile: null,
    rules: {
      required: value => !!value || "Required."
    },
    snackbar: false,
    snackbarText: "",
    btnLoading: false,
    gotUser: false
  }),
  computed: {
    avatar: function() {
      if (this.userData && this.userData.avatar) {
        return `https://static.codingame.com/servlet/fileservlet?format=profile_avatar&id=${this.userData.avatar}`;
      } else {
        return "https://static.codingame.com/assets/img_general_avatar.6f8c476b.png";
      }
    },
    cgRank: function() {
      return (
        this.userData.ranking.codingame.rank.toLocaleString() +
        "/" +
        this.userData.ranking.codingame.totalPlayers.toLocaleString()
      );
    },
    clashRank: function() {
      return (
        this.userData.ranking.clashOfCode.rank.toLocaleString() +
        "/" +
        this.userData.ranking.clashOfCode.totalPlayers.toLocaleString()
      );
    },
    userData() {
      return this.$store.state.userData;
    }
  },
  methods: {
    clicked: async function() {
      this.btnLoading = true;
      try {
        const response = await axios.get(`.netlify/functions/get-score`, {
          timeout: 10000,
          params: {
            profile: this.profile
          }
        });
        this.$store.commit("addUserData", response.data);
        this.gotUser = true;
      } catch (error) {
        console.log("Errored");
        console.error(error.response);
        this.snackbar = true;
        this.snackbarText = `Error: ${error.response.data}`;
      }
      if (this.resumeFile) {
        parseDocument(this.resumeFile, this.userData);
      }

      this.btnLoading = false;
    }
  }
};
</script>
