import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        userData: null,
        gotUser: false,
        davidScore: null,
    },
    mutations: {
        addUserData: (state, data) => {
            state.userData = data;
        },
        addDavidScore: (state, data) => {
            state.davidScore = data;
        },
    },
});
