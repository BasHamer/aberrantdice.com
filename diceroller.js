

//https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve/36481059#36481059
function bellRandom(min, max, skew) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return Math.floor(num);
}

Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};

var diceRoller = {};

diceRoller.rollDie = function(die){
    die.roll = Math.floor(Math.random() * (maximum - minimum));
};

diceRoller.evaluateDie = function(currentRoll, die){
    die.successes = die.roll >= currentRoll.targetNumber;
    if(qualityActive && die.roll == 10){
        diceRoller.addDie(currentRoll, die.isMega);
    }
};

diceRoller.addDie = function(currentRoll, isMega){

};

diceRoller.createNewRoll = function(dataModel){
    if(dataModel.currentRoll != null){
        dataModel.rollLog.insert(0,rurrentRoll);
    }

    dataModel.currentRoll={
        dice:[],
        successes:0,
        botch:false,
        revealed:true
    };
}

diceRoller.init = function(config){
    const skew = 2;

    if($("diceroller")){
        $.ajax({
            url: config??"https://aberrantdice.com/diceroller.html"
        }).then(function(data) {
            $("diceroller").html(data);

            var dataModel = {
                normalDicePool:4,
                megaDicePool:1,
                difficulty:1,
                targetNumber:7,
                qualityActive:false,
                drama:true,
                currentRoll:null,
                rollLog:[]
            };

            Vue.component('comment-view',{
                props: ['comment'], 
                template: `
                <div class="comment">
                    <h4 class="comment-title">
						<span>
                            <a class="comment-author" v-bind:href="comment.user.html_url" target="_blank">
                                {{comment.user.login}}
                            </a> 
                            commented 
                		    <a class="comment-date" v-bind:href="comment.html_url" target="_blank">
                			    <time v-bind:datetime="comment.created_at">on {{comment.created_at_local}}</time>
                		    </a>
                		</span>
            		</h4>
                    <div class="comment-body">
                        {{comment.body}} 
                    </div>
                </div>`
                });
            
            var app = new Vue({
                el: '#dice-roller-app',
                data: dataModel,
                methods:{
                    rollDice: function() {
                        diceRoller.createNewRoll(dataModel);
                    }
                }
            });
        });
    }
};



