/**
 * ihowe@outlook.com
 * author by haroel
 * Created by howe on 2017/4/23.
 */
var site = site || {};

showdown.setFlavor('github');

site._ContentType ={
    ARTICLE:0,
    TAGS:1,
    LIST:2,
    KEYNOTE:3,
    LIFE:4
};

var bodyEl = document.body;

function _toggleMenu( isOpen ) {
    if( isOpen ) {
        classie.remove( bodyEl, 'show-menu' );
    }
    else {
        classie.add( bodyEl, 'show-menu' );
    }
}

function parseUrlToObject()
{
    var result = {};
    //http://localhost:63342/i/Main.html?_ijt=va6rsa882cmbsmck0a0dget0c2&md=about.md
    var paramsStr = window.location.search;
    var reg = /\??&?([^=]+)=([^&]+)/g;
    var match = reg.exec(paramsStr);
    while (match)
    {
        result[match[1]] = match[2];
        match = reg.exec(paramsStr);
    }
    return result;
}

function changeURL( params )
{
    var searchs = [];
    for(var k in params)
    {
        if (params[k] && params[k].length>0)
        {
            searchs.push( k +"="+params[k] );
        }
    }
    var url = window.location.href;
    if (searchs.length < 1)
    {
        window.location.href = url.split("?")[0];
    }else
    {
        window.location.href = url.split("?")[0] + "?" +searchs.join("&");
    }
}

site.menuside = new Vue({
    el:'#mainDiv',
    data:
    {
        articles:site.config.articles,
        author:site.config.author,
        menuTags:["最新","分类","演示","其他","关于"],
        isShowMenu:false,
        pageContent:"",
        contentType:site._ContentType.ARTICLE,
        pageInfo:{},
        Articles:[],
    },
    created:function ()
    {
        this.pageContent = "";
        var params = parseUrlToObject();
        if (params["md"])
        {
            var pageInfo = site.getPageInfoByMDFile(params.md);
            if (pageInfo)
            {
                var that = this;
                $.get("article/" + pageInfo.file,function(data){
                    that.pageInfo = pageInfo;
                    var markdownContent = data;
                    var p = markdownContent.indexOf("---");
                    markdownContent = markdownContent.substring(markdownContent.indexOf("---"));
                    //https://github.com/showdownjs/showdown
                    var converter = new showdown.Converter();
                    converter.setOption('simplifiedAutoLink', true);
                    converter.setOption('excludeTrailingPunctuationFromURLs', true);
                    converter.setOption('tables', true);
                    converter.setOption('tasklists', true);
                    converter.setOption('simpleLineBreaks', true);
                    converter.setOption('openLinksInNewWindow', true);
                    that.pageContent = converter.makeHtml(markdownContent);
                    $('#content').html(that.pageContent);
                    $('#content code').not("pre code").addClass("LabelTag");
                    $('#content table').addClass("table table-hover table-striped");
                    $('#content img').addClass("LabelTag")
                }).error(function()
                {
                    alert("error");
                });
            }else
            {
                alert("无法找到制定的文章 《" + params.md +"》" );
            }
            return;
        }
        if (params["tag"])
        {
            this.Articles = site.getPagesByTag(params.tag);
            this.pageInfo.title = "标签:" + params.tag;
            this.contentType = site._ContentType.LIST;
            return;
        }
        this.Articles = site.getLatestPage(5);
        this.pageInfo.title = "最新";
        this.contentType = site._ContentType.LIST;
    },
    mounted:function () {

        var sources = [];
        for (var i=0;i<site.config.articles.tags.length;i++)
        {
            var tagInfo = site.config.articles.tags[i];
            sources.push({
                type:"tag",
                id:sources.length,
                name:tagInfo.name,
                value:tagInfo.name
            })
        }
        var pages = site.getAllPageNames();
        for(var i=0;i<pages.length;i++)
        {
            sources.push({
                id:sources.length,
                type:"md",
                name:pages[i].title,
                value:pages[i].file
            })
        }
        this._sources = sources;

        $("#searchInput").typeahead({
            source: sources,

            highlighter: function(item) {
                return item;
            },
            updater: function(item) {
                console.log("'" + item + "' selected.");
                return item;
            }
        });
    },

    methods:{

        formatDate: function ( time ) {

            var d = new Date( parseInt(time) );
            return d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate()+" " +d.getHours() +":"+d.getMinutes();
        },

        toggleMenus:function ()
        {
            _toggleMenu(this.isShowMenu);
            this.isShowMenu = !this.isShowMenu;
        },
        searchHandler:function ()
        {
            var ii = $("#searchInput").val();
            var arr = this._sources;
            for (var i=0;i<arr.length;i++)
            {
                var obj = arr[i];
                if (obj.name == ii)
                {
                    var params = parseUrlToObject();
                    delete params["tag"];
                    delete params["md"];
                    params[obj.type] = obj.value;
                    changeURL( params );
                    return;
                }
            }
            alert("无法找到搜索结果:",ii);
        },
        menuTagClick:function (event)
        {
            var tag = event.target.outerText;
            this.pageInfo = {};
            this.pageInfo.title = tag;
            switch(tag)
            {
                case "最新":
                {
                    var params = parseUrlToObject();
                    delete params["tag"];
                    delete params["md"];
                    changeURL(params);
                    break;
                }
                case "分类":
                {
                    this.contentType = site._ContentType.TAGS;
                    break;
                }
                case "演示":
                {
                    this.contentType = site._ContentType.KEYNOTE;
                    this.pageContent = "暂时没有内容";
                    $('#content').html(this.pageContent);
                    break;
                }
                case "其他":
                {
                    this.contentType = site._ContentType.LIFE;
                    this.pageContent = "暂时没有内容";
                    $('#content').html(this.pageContent);
                    break;
                }
                case "关于":
                {
                    var params = parseUrlToObject();
                    params.md = "ihowe.md";
                    delete params["tag"];
                    changeURL( params );
                    break;
                }
            }
        }
    }
});