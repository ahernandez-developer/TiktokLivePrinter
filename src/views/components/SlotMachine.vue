<template>
    <div>
        <div style="text-align: center; padding-top: 50px;">
            <v-row justify="center" class="text-h5">
                CUALQUIER TIPO DE DONACION = 1 GIRO
            </v-row>            
        <v-divider/>
            <v-row justify="center" class="text-h7 pt-2">
                JUGADOR ACTUAL
            </v-row>
            <v-row justify="center" class="pt-5 pb-2">
                <img :src="user.profilePictureUrl" />
            </v-row>
            <v-row justify="center">
                {{ user.nickname }}

            </v-row>

            <v-row v-if="user" justify="center font-weight-bold">              
                    PUNTOS ACUMULADOS: {{ userWins }}
            </v-row>
        </div>
        <v-divider/>
             <div class="text-center pt-2"> EN COLA: <span class="pt-2">{{donators.length,}}</span></div>
        <div class="SlotMachine">
            <v-row class="px-8">
                <v-col v-if="showComments" cols="12" md="3">
                
                    <h3 class="text-center pb-5">COMENTARIOS</h3>
                    <v-divider class="mx-15"></v-divider>
                    <div class="pb-2" v-for="comment in reversedComments">{{ comment.nickname }}: {{ comment.comment }}
                    </div>
                    
                </v-col>
                <v-col cols="12" md="3" v-else>
                    <Top :users="topWinners" />
                    <!-- <div v-for="winner in topWinners">{{ winner.nickname }}: {{ winner.win }}</div> -->
                    
                </v-col>
                <v-col cols="12" md="9">
                    <div class="container">
                        <div class="logo"></div>
                        <div class="SlotMachine-reels slot-reels-container row">
                            <div class="SlotMachine-shadow"></div>
                            <div class="SlotMachine-payline col-payline"></div>
                            <SlotReel ref="reel1" :canlock="canlock" v-on:stopped="reelStopped"></SlotReel>
                            <SlotReel ref="reel2" :canlock="canlock" v-on:stopped="reelStopped"></SlotReel>
                            <SlotReel ref="reel3" :canlock="canlock" v-on:stopped="reelStopped"></SlotReel>
                        </div>

                        <div v-if="false" class="row toolbar-container bottom">
                            <div class="SlotMachine-stats col col-left col-stats xs8 s7 m7 l8 xl8">
                                <div class="container">
                                    <div class="row">
                                        <div class="col xs4 s4 m4 l4 xl4">
                                            <div class="SlotMachine-coin btn-buy btn-coin ma-2"
                                                v-on:mousedown="insertCoin()">
                                            </div>
                                        </div>
                                        <div class="col xs4 s4 m4 l4 xl4 ">
                                            <div class="SlotMachine-stat is-credit area-credits ma-2">
                                                <div class="SlotMachine-statTitle area-title">Credits</div>
                                                <div class="SlotMachine-statValue area-value">{{ credits.toFixed(2) }}
                                                </div>
                                                <div class="SlotMachine-statSub area-value-sub">spend {{
                                                        spend.toFixed(2)
                                                }}</div>
                                            </div>
                                        </div>
                                        <div class="col xs4 s4 m4 l4 xl4">
                                            <div class="SlotMachine-stat is-win area-win ma-2">
                                                <div class="SlotMachine-statTitle area-title">Won</div>
                                                <div class="SlotMachine-statValue area-value">{{ win.toFixed(2) }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="SlotMachine-actions col col-right col-buttons xs4 s5 m5 l4 xl4">
                                <div class="SlotMachine-button is-win btn-is-win" v-bind:class="{ 'has-win': win }"
                                    v-on:mousedown="takeWin()">Take Win
                                </div>
                                <button class="SlotMachine-button is-spin btn-spin" v-on:mousedown="spin()"></button>
                            </div>

                        </div>
                    </div>
                </v-col>

            </v-row>

        </div>
    </div>
</template>

<script>
const { WebcastPushConnection } = require('electron').remote.require('tiktok-live-connector');
import SlotReel from './SlotReel';
import Top from './Top';
export default {
    name: 'SlotMachine',
    components: {
        SlotReel,
        Top
    },
    created() {
        //every minute set comments flag to true
        setInterval(() => {
            this.showComments = !this.showComments;
        }, 10000);
        let tiktokChatConnection = new WebcastPushConnection(this.tiktokUsername);
  setInterval(() => {
   
    if(this.spinning)
    return;
    this.spinning=true;
    if(this.donators.length>0){
            this.spinDonators();
    }
    else
    this.spinCommentors();
            this.spinning=false;
        }, 2000);
        // Connect to the chat (await can be used as well)
        tiktokChatConnection.connect().then(state => {
            console.info(`Connected to roomId ${state.roomId}`);
        }).catch(err => {
            console.error('Failed to connect', err);
        })

        tiktokChatConnection.on('gift', async data => {
            this.user = data;
           
           this.addDonator(this.user);
        })


        tiktokChatConnection.on('chat', data => {
            this.comments.push(data);
            this.addCommentor(data);
        })

    },
    data: function data() {
        return {
            spinning: false,
            userWins:0,
            donators: [],
            commenters: [],
            showComments: true,
            tiktokUsername: "marte19222",
            user: {},
            comments: [],
            winners: [],
            spend: 6,
            credits: 6,
            win: 0,
            resultData: false,
            canlock: true,
            waslocked: false,
            audio: {
                win: new Audio('https://freesound.org/data/previews/387/387232_1474204-lq.mp3'),
                insertCoin: new Audio('https://freesound.org/data/previews/276/276091_5123851-lq.mp3'),
                bigwin: new Audio('https://freesound.org/data/previews/270/270319_5123851-lq.mp3')
            }
        };
    },
    beforeMount: function beforeMount() { },
    mounted: function mounted() {
        window.addEventListener('keydown', this.keydown);
    },
    computed: {
        //reverse comments and take the last 15
        reversedComments: function comments() {
            return this.comments.reverse().slice(0, 10);
        },
        //sort winners by win and take the first 10
        topWinners: function winners() {
            return this.winners.sort((a, b) => b.win - a.win).slice(0, 10);
        }


    },
    methods: {
        //add donators to queue
        addDonator: function addDonator(donator) {
            this.donators.push(donator);
        },        
        //add commentors to queue
        addCommentor: function addCommentor(commentor) {
            this.commenters.push(commentor);
        },
        spinDonators(){
            console.log("cheking for donators");
            console.log(this.donators.length);
            //spin first donator in queue
            if(this.donators.length > 0){
                console.log("spinning donator" + this.donators[0].nickname);
                this.user = this.donators.shift();
                 if(this.winners.find(x => x.nickname === this.user.nickname))
              this.userWins = this.winners.find(x => x.nickname === this.user.nickname).win;
              else
              this.userWins = 0;
                this.spin();
            }

        },
        //spinCommentor
        spinCommentor(){
            console.log("cheking for commentors");
            console.log(this.commenters.length);
            //spin first commentor in queue
            if(this.commenters.length > 0){
                console.log("spinning commentor" + this.commenters[0].nickname);
                this.user = this.commenters.shift();
                this.spin();
            }
        },
        keydown: function keydown(e) {
            console.log(e.which);
            var key = {
                one: 49,
                two: 50,
                three: 51,
                space: 32
            };
            if (e.which === key.one) {
                this.$refs.reel1.lock();
                e.preventDefault();
            } else if (e.which === key.two) {
                this.$refs.reel2.lock();
                e.preventDefault();
            } else if (e.which === key.three) {
                this.$refs.reel3.lock();
                e.preventDefault();
            } else if (e.which === key.space) {
                this.spin();
                e.preventDefault();
            }
        },
        spin: function spin() {
            if (!this.resultData) {
                this.resultData = [];
                this.credits = this.credits - 0.5;
                this.$refs.reel1.run();
                this.$refs.reel2.run();
                this.$refs.reel3.run();
            }
        },
        insertCoin: function insertCoin() {
            this.audio.insertCoin.currentTime = 0;
            this.audio.insertCoin.play();
            this.credits += .5;
            this.spend += .5;
        },
        takeWin: function takeWin() {
            if (this.win > 0) {
                this.credits += this.win;
                this.win = 0;
            }
        },
        reelStopped: function reelStopped(resultData, wasLocked) {
            if (wasLocked) this.waslocked = wasLocked;

            this.resultData.push(resultData);
            if (this.resultData.length === 3) {
                this.checkWin(this.resultData);
                if (this.win > 0) {

                    //check if user.nickname is not yet in the winners list
                    let winnerUser = this.winners.find(x => x.nickname === this.user.nickname);
                    if (!winnerUser) {
                        this.winners.push({
                            nickname: this.user.nickname,
                            win: this.win
                        });
                       
                    }
                    else {
                        this.winners.find(x => x.nickname === this.user.nickname).win += this.win;
                  
                    }
                    this.showComments =false;
                    this.takeWin();
                }
                if (this.waslocked) {
                    this.waslocked = false;
                    this.canlock = false;
                } else {
                    this.canlock = true;
                }
            }
        },

        checkWin: function checkWin() {
            if (this.resultData.length === 3) {
                // ;-)
                var v1 = this.resultData[0];
                var v2 = this.resultData[1];
                var v3 = this.resultData[2];
                if (v1.name === v2.name && v2.name === v3.name) {
                    if (v1.value >= 10) {
                        this.audio.bigwin.play();
                    } else {
                        this.audio.win.play();
                    }
                    this.win += v1.value;
                    this.waslocked = true; // prevent lock after an unlocked win
                } else {
                    var bar1 = v1.name === 'Bar';
                    var bar2 = v2.name === 'Bar';
                    var bar3 = v3.name === 'Bar';
                    if (bar1 && bar2 || bar1 && bar3 || bar2 && bar3) {
                        // this.audio.bigwin.play()
                        // this.win += 16
                        // this.waslocked = true // prevent lock after an unlocked win
                    } else if (bar1 || bar2 || bar3) {
                        // this.audio.win.play()
                        // this.win += 4
                        // this.waslocked = true // prevent lock after an unlocked win
                    } else {
                        // Lose : (
                    }
                }
            }
            this.resultData = false;
        }
    }
}
</script>