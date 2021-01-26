



Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};

var diceRoller = {};

diceRoller.rollDie = function(die){
    die.roll = Math.floor(Math.random() * (10))+1;
};

diceRoller.evaluateDie = function(dataModel, die){
    die.revealed = true;
    var delay = new Promise(resolve => setTimeout(resolve, dataModel.settings.drama ? 1 : dataModel.settings.duration/2));
    delay.then(function(data){
        die.isSuccess = die.roll >= dataModel.currentRoll.rollConfig.targetNumber;
        die.isBotch = die.roll <= dataModel.currentRoll.rollConfig.botchTeshhold;
        if(dataModel.currentRoll.rollConfig.qualityActive && die.roll == 10){
            dataModel.currentRoll.dice.push(diceRoller.addDie(dataModel, die.isMega));
        }
        die.evaluated = true;
        diceRoller.evaluateRoll(dataModel);
    });
};

diceRoller.evaluateRoll = function(dataModel){
    function notRevealed(die) {
        return !die.evaluated;
      };
    if(dataModel.currentRoll.dice.find(notRevealed)){
        return;
    }
    var botch = false;
    var successes = 0;
    dataModel.currentRoll.dice.forEach(die=>{
        if(die.isBotch){
            botch = true;
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
    dataModel.currentRoll.successes = successes-dataModel.currentRoll.rollConfig.difficulty;
    dataModel.currentRoll.isBotch=(botch && !dataModel.currentRoll.isSuccess);   
    dataModel.currentRoll.revealed = true;
    dataModel.currentRoll.megaDice = _.filter(dataModel.currentRoll.dice, { 'isMega': true })
                                        .map(x=>x.roll)
                                        .reduce((x,y)=>x+", "+y);
    dataModel.currentRoll.normalDice = _.filter(dataModel.currentRoll.dice, { 'isMega': false })
                                        .map(x=>x.roll)
                                        .reduce((x,y)=>x+", "+y);
};

diceRoller.addDie = function(dataModel, isMega){
  var die = {
    isMega: isMega,
    isBotch: false,
    isSuccess: false,
    revealed: false,
    evaluated: false,
  };

  diceRoller.rollDie(die);

  //var rollDuration = bellRandom(1, dataModel.settings.duration, dataModel.settings.shift)
  var rollDuration =  Math.floor(Math.random() * (dataModel.settings.duration))+1
  var delay = new Promise(resolve => setTimeout(resolve, dataModel.settings.drama ? 1 : rollDuration));
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

diceRoller.init = function(config){
    const skew = 2;

    if($("diceroller")){
        $.ajax({
            url: config??"https://aberrantdice.com/diceroller.html"
        }).then(function(data) {
            $("diceroller").html(data);

            var dataModel = {
                settings:{
                    drama:false,
                    duration: 1500
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
                                    Pool {{roll.rollConfig.megaDicePool}}/{{roll.rollConfig.normalDicePool}}
                                </div>
                                <div class="row">
                                    TN:{{roll.rollConfig.targetNumber}} Difficulty:{{roll.rollConfig.difficulty}}
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <strong>{{roll.megaDice}}</strong> {{roll.normalDice}}
                        </div>
                        <div class="col-3">
                            <div class="result success" v-if="roll.isSuccess">
                                <h2>Success</h2> with {{roll.successes}} extra successes
                            </div>
                            <div class="result botch" v-if="roll.isBotch">
                                <h2>Botch</h2>
                            </div>
                            <div class="result" v-if="!roll.isBotch&&!roll.isSuccess">
                                <h2>Failure</h2>
                            </div>
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



