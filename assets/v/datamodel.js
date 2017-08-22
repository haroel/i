/**
 * ihowe@outlook.com
 * author by haroel
 * Created by howe on 2017/4/16.
 */
var site = site || {};

site.getLatestPage = function ( num ) {
    num = num||1;
    var result = [];
    var _p = site.config.articles.pages;
    for (var year in _p)
    {
        var yps = _p[year];
        yps.forEach(function (obj)
        {
            if (!obj.date)
            {
                return;
            }
            if (result.length < num)
            {
                result.push(obj);
            }else
            {
                for (var i =0;i< num;i++)
                {
                    if (result[i].date>obj.date)
                    {
                        result[i] = obj;
                        break;
                    }
                }
            }
        })
    }
    result.sort(function (a,b)
    {
        if (a.date < b.date)
        {
            return 1;
        }
        if (a.date < b.date)
        {
            return -1;
        }
        return 0;
    });
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
                return obj;
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
