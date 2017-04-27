/**
 * ihowe@outlook.com
 * author by haroel
 * Created by howe on 2017/4/16.
 */
var site = site || {};

site.getLatestPage = function () {

    var lastPage = null;
    var _p = site.config.articles.pages;
    var _date = 0;
    for (var year in _p)
    {
        var yps = _p[year];
        yps.forEach(function (obj)
        {
            if (obj.date>_date)
            {
                lastPage = obj;
            }
        })
    }
    return lastPage;
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
}
