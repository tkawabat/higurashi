var Higurashi = {};
(function(NS) {
    NS.Const = {
        variables: ['person', 'weapon', 'place']
        , weapon: ["ナイフ","毒","銃","トンカチ","ガス","豆腐の角"
            ,"グレートソード","五寸釘","拳","アブナイ薬"]
        , place: ["学校","病院","墓地","会社","戦場","船の上"
            ,"自宅","旅館","天上界","長野"]
        , master: "ゲームマスター"
    };
    NS.Const.vnum = NS.Const.variables.length;
    
    NS.Game = (function() {
        function Game() {
            this.row_data;
            this.all_data;
            this.your_data;
        }

        Game.prototype.start = function(name, str, seed) {
            var line = str.replace(new RegExp('　', 'g'), ' ').split('\n')
            , mt = new jg.MT(seed)
            , arr, arr2, i, n, key, num
            ;

            this.all_data = {};
            this.row_data = {};
            for (i = 0; i < NS.Const.vnum; i++) {
                this.all_data[NS.Const.variables[i]] = [];
                this.row_data[NS.Const.variables[i]] = [];
            }
            
            // パース・シャッフル
            for (i = 0; i < NS.Const.vnum; i++) {
                key = NS.Const.variables[i];

                if (i === 0) {
                    if (typeof line[i] === 'undefined'
                            || line[i].length === 0) {
                        alert("ゲームデータを入れて下さい。やり直せ");
                        return false;
                    } else {
                        arr = line[i].split(' ');
                    }
                    
                    // ゲームマスター用の名前は使えない
                    bool = arr.some(function(val) {
                        return val === NS.Const.master
                    });
                    if (bool) {
                        alert(NS.Const.master+"という名前は使えません。やり直せ。");
                        return false;
                    }

                    // ゲームマスター追加
                    arr.push(NS.Const.master);
                    num = arr.length;
                } else {
                    if (typeof line[i] === 'undefined'
                            || line[i].length === 0) {
                        arr = [];
                        arr2 = NS.Const[key].slice(0); //値移し
                        while (arr.length < num) {
                            NS.Util.rpick(arr2, arr, mt);
                        }
                    } else {
                        arr = line[i].split(' ');
                    }
                    
                    if (arr.length < num) {
                        alert(key+'が'+arr.length+"個しかありません。\n"
                            +num+"個必要です。やり直せ。");
                        return false;
                    }
                }
                
                // 生データ
                arr.forEach(function(val) {
                    this.row_data[key].push(val);
                }, this);
                
                // シャッフル
                while (arr.length > 1) {
                    NS.Util.rpick(arr, this.all_data[key], mt);
                }
                this.all_data[key].push(arr[0]);
            }
            
            // 自分のデータ作成
            this.your_data = [];
            n = this.all_data['person'].indexOf(name);

            if (n === -1) {
                alert("ゲーム内にあなたの名前がありません。やり直せ。");
                return false;
            }
            
            NS.Const.variables.forEach(function(key) {
                this.your_data.push(this.all_data[key][n]);
            }, this);
            
            return true;
        }
        Game.prototype.solve = function(str) {
            var line = str.replace(new RegExp('　', 'g'), ' ').split(' ')
            , variables = NS.Const.variables
            , bool, i, n, key
            ;
            
            if (typeof this.all_data === 'undefined') {
                alert('ゲームがスタートされていません。出直せ');
                return false;
            }
            
            // 個数チェック
            if (line.length < NS.Const.vnum - 1) {
                alert('なんか間違ってます。やり直せ');
                return false;
            }
            
            key = NS.Const.variables[0];
            n = this.all_data[key].indexOf(NS.Const.master);
            
            for (i = 1; i < NS.Const.vnum; i++) {
                if (line[i - 1] !== this.all_data[variables[i]][n]) {
                    alert('間違ってます');
                    return false;
                }
            }
            alert('正解です');
            return true;
        }
        
        return Game;
    })();
    
    NS.Util = {};
        
    /**
     * arrからarr2へランダムで値を移す
     * @param {type} arr
     * @param {type} arr2
     * @param {type} mt
     * @returns {undefined}
     */
    NS.Util.rpick = function(arr, arr2, mt) {
        n = mt.nextInt(0, arr.length);
        arr2.push(arr[n]);
        arr.splice(n, 1);
    }
    
    NS.Util.addTag = function(str, tag) {
        return '<'+tag.tag+'>'+str+'</'+tag.tag+'>';
    }
    
    NS.Util.addTagMap = function(arr, tag) {
        return arr.map(function(val) {
            return '<'+tag.tag+'>'+val+'</'+tag.tag+'>';
        });
    }
    
    NS.Util.get = function(key) {
        ret = "";
        if(window.localStorage){
            ret = window.localStorage.getItem(key);
        }
        return ret;
    }
    
    NS.Util.set = function(key, val) {
        ret = false;
        if(window.localStorage){
            window.localStorage.setItem(key, val);
            ret = true;
        }
        return ret;
    }
    
})(Higurashi);

(function(NS) {
    var game = new NS.Game()
    , util = NS.Util
    , d_game_init = $('#game_init')
    , d_your_name  = d_game_init.find('#your_name')
    , d_game_data  = d_game_init.find('#game_data')
    , d_seed       = d_game_init.find('#random_seed')
    , d_b_generate = d_game_init.find('#b_generate')
    , d_b_start    = d_game_init.find('#b_start')

    , d_game_on = $('#game_on')
    , d_all_data = d_game_on.find('#all_data')
    , d_your_data = d_game_on.find('#your_data')
    
    , d_game_answer = $('#game_answer')
    , d_answer_data = d_game_answer.find('#answer_data')
    , d_b_solve   = d_game_answer.find('#b_solve')
    ;
    
    
    d_your_name.val(util.get("your_name"));

    d_seed.val(Math.round(Math.random() * 1000000));
    
    // for debug
    //d_game_data.val('aaa\nグレートソード　トンカチ\n長野　旅館');
    
    d_b_generate.click(function() {
        d_seed.val(Math.round(Math.random() * 1000000));
    });
    
    d_b_start.click(function() {
        var arr;
        
        // localstorageに保存
        util.set("your_name", d_your_name.val());
        
        if (!game.start(d_your_name.val(), d_game_data.val(), +d_seed.val())) {
            // エラー終了
            return;
        }
        
        arr = [];
        NS.Const.variables.forEach(function(key, i) {
            arr[i] = util.addTag(key, {tag: 'th'})
                    + util.addTagMap(game.row_data[key], {tag: 'td'});
        });
        d_all_data.html(util.addTagMap(arr, {tag: 'tr'}));
        
        arr = [
            util.addTagMap(NS.Const.variables, {tag: 'th'})
            , util.addTagMap(game.your_data, {tag: 'td'})
        ];
        
        d_your_data.html(util.addTagMap(arr, {tag: 'tr'}));
    });
    
    d_b_solve.click(function() {
        game.solve(d_answer_data.val());
    });
})(Higurashi);