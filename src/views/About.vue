<template>
    <v-container>
        <v-row class="text-center" justify="center">
            <v-col class="mb-4" cols="8">
                <h1
                    class="display-2 font-weight-bold mb-3 amber--text accent-3"
                >
                    About
                </h1>
            </v-col>
        </v-row>
        <v-row class="text-left" justify="center">
            <v-col cols="8">
                <h5 class="text-h5">About</h5>
            </v-col>
        </v-row>
        <v-row class="text-left" justify="center">
            <v-col cols="8">
                <p class="text-subtitle-1">
                    This site is created and maintained by
                    <a href="https://www.davidheidelberger.com" target="_blank"
                        >David Heidelberger</a
                    >
                    (
                    <a
                        href="https://www.codingame.com/profile/9fc0551433d1b5bd380b6b4e47a56d2c7830083"
                        target="_blank"
                        >Codingame.com profile</a
                    >).
                </p>
                <p class="text-subtitle-1 mb-1 pb-1">
                    Current Codingame.com rank: {{ cgRank }}
                </p>
                <p class="text-subtitle-1 mb-1 pb-1">
                    Current Clash of Code rank: {{ cocRank }}
                </p>
                <p class="text-subtitle-1">
                    David is a full-time video editor and Emmy-nominated
                    television producer as well as a part-time software
                    developer. He uses many of the tools he's written every day
                    at his day job on a documentary series on PBS. He is
                    available for workflow consultation and custom software
                    solutions for your post-production workflow. To get in touch
                    about a consult, or just to talk about how you're using the
                    app, he'd love to
                    <a
                        href="https://www.davidheidelberger.com/lets-talk/"
                        target="_blank"
                        >hear from you</a
                    >.
                </p>
            </v-col>
        </v-row>
        <v-row class="text-left" justify="center">
            <v-col cols="8">
                <h5 class="text-h5">License</h5>
            </v-col>
        </v-row>
        <v-row class="text-left" justify="center">
            <v-col cols="8">
                <p class="text-subtitle-1">
                    The source code for this site is
                    <a
                        href="https://github.com/dheidelberger/cg-rank/tree/master"
                        target="_none"
                        >available on GitHub</a
                    >. It is licensed under an
                    <a
                        href="https://github.com/dheidelberger/cg-rank/blob/master/LICENSE.md"
                        target="_blank"
                        >MIT License</a
                    >
                </p>
            </v-col>
        </v-row>
        <v-row class="text-left" justify="center">
            <v-col cols="8">
                <h5 class="text-h5">Privacy and Legal</h5>
            </v-col>
        </v-row>
        <v-row class="text-left" justify="center">
            <v-col cols="8">
                <p class="text-subtitle-1">
                    CG Rank is not affiliated with
                    <a href="https://www.codingame.com" target="_blank"
                        >codingame.com</a
                    >.
                </p>
                <p class="text-subtitle-1">
                    CG Rank is hosted using Netlify. CG Rank does not track or
                    store any of your data. However, Netlify does store visitor
                    IP addresses for 30 days.
                    <a href="https://www.netlify.com/gdpr/" target="_blank"
                        >More information</a
                    >
                    about Netlify's privacy policy,
                </p>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
const axios = require('axios');
export default {
    name: 'Home',

    data: () => ({
        cgRank: 'loading...',
        cocRank: 'loading...',
    }),
    async mounted() {
        try {
            const response = await axios.get(`.netlify/functions/get-score`, {
                timeout: 10000,
                params: {
                    profile: 'typingm',
                },
            });

            this.cgRank = `${response.data.ranking.codingame.rank.toLocaleString()}/${response.data.ranking.codingame.totalPlayers.toLocaleString()}`;
            this.cocRank = `${response.data.ranking.clashOfCode.rank.toLocaleString()}/${response.data.ranking.clashOfCode.totalPlayers.toLocaleString()}`;
        } catch (error) {
            console.log('Errored');
            console.error(error);
            this.cgRank = 'Error loading Codingame rank';
            this.cocRank = 'Error loading Clash of Code rank';
        }
    },
};
</script>
