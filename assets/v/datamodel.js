/**
 * ihowe@outlook.com
 * author by haroel
 * Created by howe on 2017/4/16.
 */
var site = site || {};

site.getTags = function () {
    var tags = {};
    for(var i = 0;i<site.config.pages.length;i++)
    {
        var info = site.config.pages[i];
        if (info.tags)
        {
            for (var j=0;j<info.tags.length;j++)
            {
                tags[ info.tags[j].toLowerCase() ] = 1;
            }
        }
    }
    var result = [];
    for (var k in tags)
    {
        result.push(k);
    }
    return result;
};

site.getPagesByTag = function ( tag ) {
    tag = tag.toLowerCase();
    var result = [];
    for(var i = 0;i<site.config.pages.length;i++)
    {
        var info = site.config.pages[i];
        if (info.tags)
        {
            for (var j=0;j<info.tags.length;j++)
            {
                var __tag = info.tags[j].toLowerCase();
                if (tag === __tag)
                {
                    result.push(info);
                    break;
                }
            }
        }
    }
    return result;
};

