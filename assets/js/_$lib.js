/**
 * Created by howe on 2016/11/29.
 */
var g = g || {};

function isChineseChar(str){
    var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    return reg.test(str);
}


g.Hash = function () {
    var _content = {};
    var len = 0;

    this.set = function (key, obj)
    {
        if (!_content[key])
        {
            ++len;
        }
        _content[key] = obj;
    };

    this.delete = function (key)
    {
        if(this.has(key))
        {
            _content[key] = null;
            delete _content[key];
            --len;
        }
    };
    this.get = function(key)
    {
        return _content[key]
    };
    this.has = function(key)
    {
        if(_content[key])
        {
            return true;
        }
        return false;
    };
    this.values = function(key)
    {
        var _arr = [];
        for (var key in _content) {
            _arr.push(_content[key]);
        }
        return _arr;
    };
    this.keys = function(key)
    {
        var _arr = [];
        for (var key in _content) {
            _arr.push(key);
        }
        return _arr;
    };
    this.size = function () {
        return len;
    };
    this.forEach = function (callback)
    {
        for (var key in _content) {
            callback(key, _content[key] );
        }
    }
};

g.MultiHash = function () {
    var _content = {};
    var len = 0;

    this.set = function (key, obj)
    {
        if (!_content[key] )
        {
            _content[key] = [];
            ++len;
        }
        _content[key].push(obj);
    };

    this.delete = function (key)
    {
        _content[key] = null;
        delete _content[key];
        --len;
    };
    this.get = function(key)
    {
        return _content[key]
    };
    this.has = function(key)
    {
        if(_content[key])
        {
            return true;
        }
        return false;
    };
    this.values = function(key)
    {
        var _arr = [];
        for (var key in _content) {
            _arr.push(_content[key]);
        }
        return _arr;
    };
    this.keys = function(key)
    {
        var _arr = [];
        for (var key in _content) {
            _arr.push(key);
        }
        return _arr;
    };
    this.size = function () {
        return len;
    };

    this.forEach = function (callback)
    {
        for (var key in _content) {
            callback(key, _content[key] );
        }
    }
};

jQuery.fn.extend({
    /**
     * ctrl+enter提交表单
     * @param {Function} fn 操作后执行的函数
     * @param {Object} thisObj 指针作用域
     */
    ctrlSubmit:function(fn,thisObj){
        var obj = thisObj || this;
        var stat = false;
        return this.each(function(){
            $(this).keyup(function(event){
                //只按下ctrl情况，等待enter键的按下
                if(event.keyCode == 17){
                    stat = true;
                    //取消等待
                    setTimeout(function(){
                        stat = false;
                    },300);
                }
                if(event.keyCode == 13 && (stat || event.ctrlKey)){
                    fn.call(obj,event);
                }
            });
        });
    }
});


g.getImageSize = function ( src )
{
    var imgsize={
        width:0,
        height:0
    };
    image=new image();
    image.src=src;
    imgsize.width =image.width;
    imgsize .height=image.height;
    return imgsize;
};

g.getTime0 = function( d )
{
    if (!d)
    {
        d = new Date();
    }else
    {
        d = new Date(d);
    }
    function p(s) {
        return s < 10 ? '0' + s: s;
    }
    return p(d.getHours()) +":"+ p(d.getMinutes()) +":"+p(d.getSeconds());
};
