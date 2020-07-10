import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        userData: null,
        gotUser: false,
    },
    mutations: {
        addUserData: (state, data) => {
            state.userData = data;
        },
    },
});
