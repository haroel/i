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

};

