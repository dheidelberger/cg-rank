<template>
    <v-app>
        <v-app-bar app dark>
            <v-avatar :tile="true"
                ><v-img :src="require('@/assets/cgrank_icon_white.png')"
            /></v-avatar>
            <v-toolbar-title class="accent--text ml-4">
                CG Rank</v-toolbar-title
            >
            <v-spacer></v-spacer>
            <router-link to="/" class="route" exact>
                <v-btn text color="accent--text">
                    Home
                </v-btn>
            </router-link>
            <router-link to="/playground" class="route" exact>
                <v-btn text color="accent--text">
                    Playground
                </v-btn>
            </router-link>
            <router-link class="route" to="/about">
                <v-btn text color="accent--text">
                    About
                </v-btn>
            </router-link>
        </v-app-bar>

        <v-main>
            <keep-alive>
                <router-view> </router-view>
            </keep-alive>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'App',

    data: () => ({
        //
    }),
};
</script>
<style scoped>
.route {
    text-decoration: none;
}
.router-link-exact-active {
    /* background-color: #404040; */
    /* background-color: #ff0000; */
    text-decoration: underline;
}
</style>
