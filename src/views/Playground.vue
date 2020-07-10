<template>
    <v-container>
        <v-row class="text-center" justify="center">
            <v-col class="mb-2" cols="8">
                <h1
                    class="display-2 font-weight-bold mb-3 amber--text accent-3"
                >
                    Playground
                </h1>

                <p class="subheading font-weight-regular">
                    Play around with the available tags to see how you can
                    templatize your resumé.
                    <span v-if="!this.$store.state.userData"
                        >Data shown in the playground is dummy data.</span
                    >
                </p>
            </v-col>
        </v-row>
        <v-row class="mt-0">
            <v-col cols="12" class="mt-0">
                <v-col cols="12">
                    <h4 class="pt-1 text-h5">Sample Template:</h4>
                </v-col>
                <v-textarea
                    id="playground-textarea"
                    label="Sample template:"
                    v-model="templateText"
                    full-width
                    no-resize
                    outlined
                    autofocus
                    rows="3"
                    hide-details
                ></v-textarea>
            </v-col>
            <v-col cols="12">
                <v-col cols="12">
                    <h4 class="pt-1 text-h5">Sample Output:</h4>
                </v-col>
                <v-card>
                    <v-card-text class="text-h5">{{
                        parseTemplate(templateText)
                    }}</v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row justify="center">
            <v-col cols="12">
                <v-sheet elevation="6">
                    <v-col cols="12">
                        <h4 class="pt-3 text-h5">Available Tags</h4>
                    </v-col>

                    <v-simple-table fixed-header height="400px">
                        <thead>
                            <tr>
                                <th class="text-left">Tag</th>
                                <th class="text-left">Description</th>
                                <th class="text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                class="text-left"
                                v-for="key in Object.keys(tags)"
                                :key="tags[key].tag"
                            >
                                <td>{{ mustache(tags[key].tag) }}</td>
                                <td>{{ tags[key].description }}</td>
                                <td width="80px">
                                    <v-tooltip left>
                                        <template
                                            v-slot:activator="{ on, attrs }"
                                        >
                                            <v-icon
                                                v-bind="attrs"
                                                v-on="on"
                                                small
                                                class="mr-2"
                                                @click="copyItem(tags[key])"
                                                >mdi-content-copy</v-icon
                                            >
                                        </template>
                                        <span>
                                            Copy tag
                                            {{ mustache(tags[key].tag) }} to
                                            clipboard
                                        </span>
                                    </v-tooltip>
                                    <v-tooltip left>
                                        <template
                                            v-slot:activator="{ on, attrs }"
                                        >
                                            <v-icon
                                                v-bind="attrs"
                                                v-on="on"
                                                small
                                                class="mr-2"
                                                @click="tryItem(tags[key])"
                                                >mdi-code-braces</v-icon
                                            >
                                        </template>
                                        <span>
                                            Insert tag
                                            {{ mustache(tags[key].tag) }} into
                                            playground
                                        </span>
                                    </v-tooltip>
                                </td>
                            </tr>
                        </tbody>
                    </v-simple-table>
                </v-sheet>
            </v-col>
        </v-row>
        <v-snackbar
            v-model="snackbar"
            :color="snackbarColor"
            :timeout="snackbarTime"
            dark
        >
            {{ snackbarText }}
            <template v-slot:action="{ attrs }">
                <v-btn text v-bind="attrs" @click="snackbar = false"
                    >Close</v-btn
                >
            </template>
        </v-snackbar>
    </v-container>
</template>

<script>
import { tags as myTags } from '../tags';
import insertTextAtCursor from 'insert-text-at-cursor';

export default {
    name: 'Playground',

    data: () => ({
        tags: null,
        snackbar: false,
        snackbarColor: 'success',
        snackbarText: '',
        snackbarTime: 3000,
        templateText: `U.S. Style: Ranked {cgRank::,}{cgOrd} on Codingame out of {cgTotal::,} (top {cgPerc}%). EU Style: Ranked {cocRank::.}{cocOrd}/{cocTotal::.} in Clash of Code (top {cocPerc::2::,}%). Rankings current as of {date::MMMM Do, YYYY}.`,
    }),
    created() {
        this.tags = myTags;
    },
    computed: {
        myData() {
            const stateData = this.$store.state.userData;
            if (stateData) {
                return stateData;
            } else {
                return {
                    ranking: {
                        codingame: { rank: 6355, totalPlayers: 286762 },
                        clashOfCode: { rank: 1034, totalPlayers: 177279 },
                    },
                };
            }
        },
    },
    methods: {
        parseTemplate(templateText) {
            let myData = this.myData;
            let keys = Object.keys(this.tags);
            let tagArray = keys
                .map((key) => this.tags[key])
                .sort((a, b) => a.priority - b.priority);
            let outText = templateText;
            for (let tag of tagArray) {
                const thisRX = new RegExp(`\\{${tag.regex}\\}`, 'g');

                outText = outText.replace(thisRX, (match, p1, p2, p3) => {
                    const newText = tag.transform(
                        myData,
                        JSON.stringify([p1, p2, p3])
                    );

                    return newText;
                });
            }

            return outText;
        },
        mustache: function(str) {
            return `{${str}}`;
        },
        copyItem: function(item) {
            const vm = this;
            this.parseTemplate(this.templateText);
            this.$copyText(vm.mustache(item.tag)).then(
                function() {
                    // alert('Copied');
                    vm.snackbarText = `Copied tag: ${vm.mustache(item.tag)}`;
                    vm.snackbarColor = 'accent';
                    vm.snackbar = true;
                    vm.snackbarTime = 3000;
                },
                function() {
                    vm.snackbarText = `Error: Could not copy ${vm.mustache(
                        item.tag
                    )}`;
                    vm.snackbarColor = 'error';
                    vm.snackbarTime = 8000;
                    vm.snackbar = true;
                }
            );
        },
        tryItem: function(item) {
            let textArea = document.querySelector('#playground-textarea');
            insertTextAtCursor(textArea, this.mustache(item.tag));
        },
    },
};
</script>
