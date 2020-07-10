import Vue from 'vue';
import Vuetify from 'vuetify/lib';

// eslint-disable-next-line
// import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            dark: {
                primary: '#454C55',
                accent: '#F2BB13',
                secondary: '#ffe18d',
                success: '#4CAF50',
                info: '#2196F3',
                warning: '#FB8C00',
                error: '#FF5252',
                anchor: '#F2BB13',
            },
            light: {
                primary: '#86B4F1',
                accent: '#F2BB13',
                secondary: '#30b1dc',
                success: '#4CAF50',
                info: '#2196F3',
                warning: '#FB8C00',
                error: '#FF5252',
                anchor: '#F2BB13',
            },
        },
    },
});
