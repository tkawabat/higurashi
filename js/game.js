var Higurashi = {};
(function(NS) {
    NS.Const = {
        variables: ['person', 'weapon', 'place']
        , person: ["カザック","ファスター","シセルド","ボビー","霧香"
            ,"スーラ","三毛子","鮮血の鯨","ラセル","ツドイ"]
        , weapon: ["ナイフ","毒","銃","トンカチ","ガス","豆腐の角"
            ,"グレートソード","五寸釘","拳","アブナイ薬"]
        , place: ["学校","病院","墓地","協会","戦場","船の上"
            ,"自宅","ディルス","天上界","長野"]
        , master: "ゲームマスター"
    };
    NS.Const.vnum = NS.Const.variables.length;
    
    NS.Game = (function() {
        function Game() {
            this.row_data;
            this.all_data;
            this.names;
        }

        Game.prototype.start = function(name, str, seed) {
            var mt = new jg.MT(seed)
            , bool, arr, arr2, i, n, key, num
            ;

            this.all_data = {};
            this.row_data = {};
            this.names = [];
            for (i = 0; i < NS.Const.vnum; i++) {
                this.all_data[NS.Const.variables[i]] = [];
                this.row_data[NS.Const.variables[i]] = [];
            }

            // 空白処理
            str = str.replace(new RegExp('　', 'g'), ' ')
                    .replace(new RegExp(' +', 'g'), ' ')
                    .trim()
                    ;
            if (str === '') {
                alert("参加者を入れて下さい。やり直せ");
                return false;
            }
            
            // パース
            arr = str.split(' ');
            
            // ゲームマスター用の名前は使えない
            bool = arr.some(function(val) {
                return val === NS.Const.master
            });
            if (bool) {
                alert(NS.Const.master+"という名前は使えません。やり直せ。");
                return false;
            }
            
            // 自分の名前があるかチェック
            n = arr.indexOf(name);
            if (n === -1) {
                alert("ゲーム内にあなたの名前がありません。やり直せ。");
                return false;
            }
            
            // ゲームマスター追加
            arr.push(NS.Const.master);
            num = arr.length;
            
            // シャッフル
            for (i = 0; i < num; i++) {
                NS.Util.rpick(arr, this.names, mt);
            }
            
            // 各パラメタの値を持ってきてシャッフル
            for (i = 0; i < NS.Const.vnum; i++) {
                key = NS.Const.variables[i];
                arr = [];
                arr2 = NS.Const[key].slice(0); // 定数から値移し

                // 個数チェック
                if (arr2.length < num) {
                    alert(key+'が'+arr2.length+"個しかありません。\n"
                            +num+"個必要です。未対応です。");
                    return false;
                }

                // 定数内からランダムピック
                while (arr.length < num) {
                    NS.Util.rpick(arr2, arr, mt);
                }
                
                // シャッフル前のデータ作成
                arr.forEach(function(val) {
                    this.row_data[key].push(val);
                }, this);
                
                // シャッフル
                while (arr.length > 0) {
                    NS.Util.rpick(arr, this.all_data[key], mt);
                }
            }
            
            return true;
        }
        /* 名前を入れたらそのデータを配列で返す関数
         * 
         * @param {type} name
         * @returns {Array} ret
         */
        Game.prototype.getMyData = function(name) {
            ret = [];
            n = this.names.indexOf(name);
            if (n === -1) {
                alert('システムエラーです。ごめんなさい\n');
                ret = null;
            } else {
                NS.Const.variables.forEach(function(key) {
                    ret.push(this.all_data[key][n]);
                }, this);
            }
            return ret;
        }
        Game.prototype.solve = function(str) {
            var line
            , arr, i
            ;
            
            // 空白処理
            str = str.replace(new RegExp('　', 'g'), ' ')
                    .replace(new RegExp(' +', 'g'), ' ')
                    .trim()
                    ;
            if (str === '') {
                alert("入力がありません。やり直せ");
                return false;
            }
            
            // パース
            line = str.split(' ');
            
            // 個数チェック
            if (line.length < NS.Const.vnum) {
                alert(NS.Const.vnum+'個答えを入れて下さい。やり直せ');
                return false;
            }
            
            arr = this.getMyData(NS.Const.master);
            
            for (i = 1; i < this.names.length; i++) {
                if (line[i] !== arr[i]) {
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
    , d_your_name    = d_game_init.find('#your_name')
    , d_player_names = d_game_init.find('#player_names')
    , d_seed         = d_game_init.find('#random_seed')
    , d_b_generate   = d_game_init.find('#b_generate')
    , d_b_start      = d_game_init.find('#b_start')

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
    //d_player_names.val('  　aaa 　bbb　 ccc  ');
    
    d_b_generate.click(function() {
        d_seed.val(Math.round(Math.random() * 1000000));
    });
    
    d_b_start.click(function() {
        var name = d_your_name.val()
        , arr, n;
        
        // localstorageに保存
        util.set("your_name", d_your_name.val());
        
        if (!game.start(name, d_player_names.val(), +d_seed.val())) {
            return; // エラー終了
        }
        
        arr = [];
        n = game.names.indexOf(name);
        NS.Const.variables.forEach(function(key, i) {
            arr[i] = util.addTag(key, {tag: 'th'})
                    + util.addTagMap(game.row_data[key], {tag: 'td'});
        });
        d_all_data.html(util.addTagMap(arr, {tag: 'tr'}));
       
        arr = game.getMyData(name);
        
        if (!arr) return;
        
        arr = [
            util.addTagMap(NS.Const.variables, {tag: 'th'})
            , util.addTagMap(arr, {tag: 'td'})
        ];
        
        d_your_data.html(util.addTagMap(arr, {tag: 'tr'}));
    });
    
    d_b_solve.click(function() {
        game.solve(d_answer_data.val());
    });
})(Higurashi);