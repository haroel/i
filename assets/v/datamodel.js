/**
 * ihowe@outlook.com
 * author by haroel
 * Created by howe on 2017/4/16.
 */
var site = site || {};
site._articles = [];
site.init = function () {
    var _p = site.config.articles.pages;
    for (var year in _p) {
        var yps = _p[year];
        for(var i=0;i<yps.length;i++)
        {
            var obj = yps[i];
            if (obj.tags && obj.date){
                site._articles.push(obj);
            }
        }
    }
    site._articles.sort(function (a,b) {
        return a.date - b.date;
    });
};

site.getLatestPage = function ( num ) {
    num = num||1;
    var result = [];
    var _p = site.config.articles.pages;
    var Y = (new Date()).getFullYear();
    while (result.length<num){
        var yearInfo = _p[Y];
        while (!yearInfo){
            yearInfo = _p[--Y];
        }
        if (yearInfo){
            yearInfo.forEach(function (obj) {
                result.push(obj);
            });
        }
    }
    return result;
};
site.getAllPageNames = function ()
{
    var arr = [];
    var _p = site.config.articles.pages;
    for (var year in _p)
    {
        var yps = _p[year];
        for(var i=0;i<yps.length;i++)
        {
            var obj = yps[i];
            arr.push(obj);
        }
    }
    return arr;
};

site.getYears = function ()
{
    var arr = [];
    var _p = site.config.articles.pages;
    for (var year in _p)
    {
        if (year >0){
            arr.push(year)
        }
    }
    return arr;
};

site.getPageInfoByMDFile = function (mdFile)
{
    if (!mdFile)
    {return null}
    var _p = site.config.articles.pages;
    for (var year in _p)
    {
        var yps = _p[year];
        for(var i=0;i<yps.length;i++)
        {
            var obj = yps[i];
            if (obj.file == mdFile)
            {
                var ret = {};
                ret.current = obj;
                for (var i = 0;i<site._articles.length;i++){
                    if (site._articles[i].file == mdFile)
                    {
                        ret.prev = site._articles[i-1];
                        ret.next = site._articles[i+1];
                    }
                }
                return ret;
            }
        }
    }
    console.log("not found",mdFile);
};

site.getPagesByTag = function ( tag )
{
    if (!tag)
    {return null}
    var result = [];
    var _p = site.config.articles.pages;
    for (var year in _p)
    {
        var yps = _p[year];
        for(var i=0;i<yps.length;i++)
        {
            var obj = yps[i];
            if (!obj.date)
            {
                continue;
            }
            if (obj.tags.indexOf(tag) >= 0)
            {
                result.push(obj);
            }
        }
    }
    return result;
};
site.getPagesByYear = function ( year )
{
    if (!year)
    {return null}
    var _p = site.config.articles.pages;
    return _p[year];
};
