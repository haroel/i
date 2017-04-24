/**
 * ihowe@outlook.com
 * author by haroel
 * Created by howe on 2017/4/23.
 */
var site = site || {};

site._ContentType ={
    ARTICLE:0,
    TAGS:1,

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

function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}

function changeURLPar(destiny, par, par_value)
{
    var pattern = par+'=([^&]*)';
    var replaceText = par+'='+par_value;
    if (destiny.match(pattern))
    {
        var tmp = '/\\'+par+'=[^&]*/';
        tmp = destiny.replace(eval(tmp), replaceText);
        return (tmp);
    }
    else
    {
        if (destiny.match('[\?]'))
        {
            return destiny+'&'+ replaceText;
        }
        else
        {
            return destiny+'?'+replaceText;
        }
    }
    return destiny+'\n'+par+'\n'+par_value;
}

function changeURL( mdFileName)
{
    var mdFile = GetQueryString("md");
    if (mdFile)
    {
        window.location.href= changeURLPar(window.location.href,"md",mdFileName);
    }else
    {
        var url = window.location.href;
        if (url.indexOf("?")<0)
        {
            url += "?";
        }
        window.location.href= url + "&md=" + mdFileName;
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
        pageTitle:"",
        pageContent:"",
        contentType:site._ContentType.ARTICLE
    },
    created:function ()
    {
        var mdFile = GetQueryString("md");
        if (mdFile)
        {
            var that = this;
            $.get("article/" + mdFile,function(data){
                this.pageTitle = "关于";
                that.pageContent = markdown.toHTML(data,"Maruku");
            }).error(function() { alert("error"); });
        }else
        {
            // 显示默认的最新文章

        }
    },
    methods:{
        toggleMenus:function ()
        {
            _toggleMenu(this.isShowMenu);
            this.isShowMenu = !this.isShowMenu;
        },
        tagClick:function (event)
        {
            var tag = event.target.outerText;
            switch(tag)
            {
                case "最新":
                {

                    break;
                }
                case "分类":
                {
                    this.contentType = site._ContentType.TAGS;
                    break;
                }
                case "演示":
                {
                    break;
                }
                case "其他":
                {
                    break;
                }
                case "关于":
                {
                    changeURL("about.md");
                    break;
                }
            }
        }
    }



});