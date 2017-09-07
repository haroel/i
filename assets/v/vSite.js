/**
 * ihowe@outlook.com
 * author by haroel
 * Created by howe on 2017/4/23.
 */
var site = site || {};

site._ContentType ={
    ARTICLE:0,
    TAGS:1,
    LIST:2,
    KEYNOTE:3,
    LIFE:4
};

function parseUrlToObject()
{
    var result = {};
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
function dateFtt(fmt,date) {
    var o = {
        "M+" : date.getMonth()+1,                 //月份
        "d+" : date.getDate(),                    //日
        "h+" : date.getHours(),                   //小时
        "m+" : date.getMinutes(),                 //分
        "s+" : date.getSeconds(),                 //秒
        "q+" : Math.floor((date.getMonth()+3)/3), //季度
        "S"  : date.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}

site.menuside = new Vue({
    el:'#mainDiv',
    data:
    {
        showLoading:true,
        isShowMenu:false,
        pageContent:"",

        articles:site.config.articles,
        author:site.config.author,
        menuTags:site.config.menus,
        contentType:site._ContentType.ARTICLE,
        toolsList:site.config.toolsList,
        pageInfo:{},
        Articles:[],

        prevData:null,
        nextData:null
    },

    created:function ()
    {
        site.init();

        $(function () { $("[data-toggle='tooltip']").tooltip(); });
        showdown.setFlavor('github');
        hljs.initHighlightingOnLoad();
        this.pageContent = "";
        var params = parseUrlToObject();
        this.renderPage(params);
    },

    mounted:function () {
        var sources = [];
        site.getAllPageNames().forEach(function (pageInfo) {
            sources.push({
                id:sources.length,
                type:"md",
                name:pageInfo.title,
                value:pageInfo.file
            })
        });
        site.config.articles.tags.forEach(function (tagInfo) {
            sources.push({
                type:"tag",
                id:sources.length,
                name:"标签:"+tagInfo.name,
                value:tagInfo.name
            })
        });
        site.getYears().forEach(function (year) {
            sources.push({
                id:sources.length,
                type:"year",
                name:"年份:"+year,
                value:year
            })
        });
        $("#searchInput").typeahead(
            {
            source: sources,
            autoSelect: true,
            fitToElement:true,
            afterSelect:function (item) {
                var params = {};
                params[item.type] = item.value;
                changeURL(params);
            }
        });
    },

    methods:{
        renderPage:function(params)
        {
            if (params["md"])
            {
                var pageData = site.getPageInfoByMDFile(params.md);
                if (pageData)
                {
                    var that = this;
                    $.get("article/" + pageData.current.file,function(data){

                        that.showLoading = false;

                        that.pageInfo = pageData.current;
                        that.prevData = pageData.prev;
                        that.nextData = pageData.next;

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
                        $('#content img').addClass("LabelTag");
                        $('pre code').each(function(i, block) {
                            hljs.highlightBlock(block);
                        });
                    });
                }else
                {
                    alert("无法找到制定的文章 《" + params.md +"》" );
                }
                return;
            }
            this.showLoading = false;
            if (params["tag"])
            {
                this.Articles = site.getPagesByTag(params.tag);
                this.pageInfo.title = "标签:" + params.tag;
                this.contentType = site._ContentType.LIST;
                return;
            }
            if (params["year"])
            {
                this.Articles = site.getPagesByYear(params.year);
                this.pageInfo.title = "时间:" + params.year;
                this.contentType = site._ContentType.LIST;
                return;
            }
            this.Articles = site.getLatestPage(5);
            this.pageInfo.title = "最新";
            this.contentType = site._ContentType.LIST;
        },
        formatDate: function ( time ) {
            return dateFtt("yyyy-MM-dd hh:mm", new Date( parseInt(time) ) );
        },

        toggleMenus:function ()
        {
            this.isShowMenu = !this.isShowMenu;
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