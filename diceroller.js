

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
    die.roll = Math.floor(Math.random() * (10))+1;
};

diceRoller.evaluateDie = function(dataModel, die){
    die.revealed = true;
    var delay = new Promise(resolve => setTimeout(resolve, 800));
    delay.then(function(data){
        die.isSuccess = die.roll >= dataModel.currentRoll.rollConfig.targetNumber;
        die.isBotch = die.roll <= dataModel.currentRoll.rollConfig.botchTeshhold;
        if(dataModel.currentRoll.rollConfig.qualityActive && die.roll == 10){
            dataModel.currentRoll.dice.push(diceRoller.addDie(dataModel, die.isMega));
        }
        diceRoller.evaluateRoll(dataModel);
    });
};

diceRoller.evaluateRoll = function(dataModel){
    function notRevealed(die) {
        return !die.revealed;
      };
    if(dataModel.currentRoll.dice.find(notRevealed)){
        return;
    }
    var botched = false;
    var successes = 0;
    dataModel.currentRoll.dice.forEach(die=>{
        if(die.isBotch && !botched){
            botched = true;
        }
        if(die.isSuccess){
            if(die.isMega){
                successes+=2;
                if(die.roll==10){
                    successes+=1;
                }
            }else{
                successes+=1;
            }
        }
    });  

    dataModel.currentRoll.isSuccess = successes>=dataModel.currentRoll.rollConfig.difficulty;
    dataModel.currentRoll.successes = successes;
    dataModel.currentRoll.isBotch=(botched && dataModel.currentRoll.successes==0);
    dataModel.currentRoll.revealed = true;
};

diceRoller.addDie = function(dataModel, isMega){
  var die = {
    isMega: isMega,
    isBotch: false,
    isSuccess: false,
    revealed: false,
  };

  diceRoller.rollDie(die);

  //var rollDuration = bellRandom(1, dataModel.settings.duration, dataModel.settings.shift)
  var rollDuration =  Math.floor(Math.random() * (dataModel.settings.duration))+1
  var delay = new Promise(resolve => setTimeout(resolve, rollDuration));
  delay.then(function(data){
      diceRoller.evaluateDie(dataModel, die);
  });

  return die
};

diceRoller.createNewRoll = function(dataModel){
    if(dataModel.currentRoll?.revealed == false){
        return;
    }
    if(dataModel.currentRoll != null){
        dataModel.rollLog.insert(0,dataModel.currentRoll);
    }

    dataModel.currentRoll={
        dice:[],
        successes:0,
        isBotch: false,
        isSuccess: false,
        revealed: false,
        rollConfig:{ ... dataModel.rollConfig}
    };

    for(var i =0; i< dataModel.rollConfig.megaDicePool; i++){
        dataModel.currentRoll.dice.push(diceRoller.addDie(dataModel, true));
    }

    for(var i =0; i< dataModel.rollConfig.normalDicePool; i++){
        dataModel.currentRoll.dice.push(diceRoller.addDie(dataModel, false));
    }

    dataModel.currentRoll.dice.forEach(die => {
        var d = die;
        
    });
}

diceRoller.reroll = function(dataModel){
    if(dataModel.currentRoll?.revealed == false){
        return;
    }


}

diceRoller.init = function(config){
    const skew = 2;

    if($("diceroller")){
        $.ajax({
            url: config??"https://aberrantdice.com/diceroller.html"
        }).then(function(data) {
            $("diceroller").html(data);

            var dataModel = {
                settings:{
                    drama:true,
                    duration: 1500,
                    shift: 0.1,
                    dramapTriggerPrcentage:50
                },
                rollConfig:{
                    normalDicePool:4,
                    megaDicePool:1,
                    difficulty:1,
                    targetNumber:7,
                    botchTeshhold:1,
                    qualityActive:false,
                    quality:""
                },
                currentRoll:null,
                rollLog:[]
            };

            Vue.component('die-view',{
                props: ['die'], 
                template: `
                <div class="col">
                    <div 
                    class="roll container"
                    v-bind:class="{ mega: die.isMega, botch: die.isBotch, success: die.isSuccess }"
                    >
                        <div v-if="!die.revealed" class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <span v-if="die.revealed">{{die.roll}}</span>
                    </div>
                </div>`
                });

                Vue.component('roll-view',{
                    props: ['roll'], 
                    template: `
                    <div class="row">
                        <div class="col-3">
                            <div class="container">
                                <div class="row">
                                    Pool 10/3
                                </div>
                                <div class="row">
                                    TN:7 Difficulty:1
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            1, 2, 3, 4, 5, 6, 7, 8, 9, <strong>10</strong> 
                        </div>
                        <div class="col-3">
                            Success 
                        </div>
                    </div>`
                    });
            
            var app = new Vue({
                el: '#dice-roller-app',
                data: dataModel,
                methods:{
                    rollDice: function() {
                        diceRoller.createNewRoll(dataModel);
                    },
                    rerollDice: function() {
                        diceRoller.reroll(dataModel);
                    }
                }
            });
        });
    }
};



