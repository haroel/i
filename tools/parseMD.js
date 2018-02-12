/**
 * ihowe@outlook.com
 * author by haroel
 * Created by howe on 2017/4/23.
 */
const fs = require("fs");
const path = require("path");

let projPath = path.dirname(__dirname);
let jsonContents = {};

jsonContents.author = {
    "icon": "https://tva4.sinaimg.cn/crop.0.0.180.180.180/6d0d5ef5jw1e8qgp5bmzyj2050050aa8.jpg",
    "img":"assets/img/howe.png",
    "name": "ihowe",
    "email": "ihowe@outlook.com",
    "address": " 武汉",
    "career": "程序员  ",
    "desc":"蛰伏中，寻求灵感",
    "version":"v0.9beta9"
};
jsonContents.menus = ["最新","分类","演示","其他","关于"];
jsonContents.toolsList = [
    {
        title:"武汉公交",
        text:" 查询公交站以及实时到站信息,所有数据来源于武汉公交集团http://www.wuhanbus.com/index.html",
        url:'http://www.wuhanbus.com/index.html'
    }
];

let articlePath = path.join( projPath ,"article" );
let files = fs.readdirSync(articlePath);
jsonContents.articles = {};
jsonContents.articles.pages = {};
jsonContents.articles.pages["0"] =
[{
    title:"关于",
    file:"ihowe.md"
}];
let tagMap = new Map();
for (let dir of files)
{
    if(/\d+/.test(dir))
    {
        let dateDir = path.join(articlePath,dir);
        let mdfiles = fs.readdirSync(dateDir);
        jsonContents.articles.pages[dir] = [];
        for (let mdfile of mdfiles)
        {
            let mdContent = fs.readFileSync( path.join( dateDir,mdfile),"utf8" );
            let reg = /\*\s+date:`([^\n]+)`/gm;
            let arr = reg.exec(mdContent);
            let _date = "";
            if ( !arr )
            {
                _date = Date.now();
                mdContent = "* date:`" + _date +"`\n"+ mdContent;
                fs.writeFile( path.join( dateDir,mdfile), mdContent,function (error) {
                    if (error)
                    {
                        console.log(error);
                    }
                });
            }else
            {
                _date = arr[1];
            }
            _date = parseInt(_date);
            mdContent = mdContent.split("---")[0];
            let obj = {};
            obj.date = _date;
            obj.file = dir + "/" + mdfile;
            obj.title = /\*\s+title:`([^`]+)`/gm.exec(mdContent)[1];
            let _tags = /\*\s+tags:([^\n]+)/gm.exec(mdContent)[1];
            let rets = _tags.match(/[^`]+/g);
            rets = rets.filter(function (tag) {
                tag = tag.replace(/\s+/,"");
                return !!tag;
            });
            obj.tags = rets.map( function ( tag ) {
                // tag = tag.substr(1,tag.length-2);
                if (tagMap.has(tag))
                {
                    let obj = tagMap.get(tag);
                    obj.count = obj.count +1;
                    if (obj.lastUpdate < _date)
                    {
                        obj.lastUpdate = _date;
                    }
                }else
                {
                    let obj = {};
                    obj.count = 1;
                    obj.lastUpdate = _date;
                    tagMap.set(tag,obj);
                }
                return tag;
            });
            jsonContents.articles.pages[dir].push(obj);

        }

        jsonContents.articles.pages[dir].sort(function (a,b) {
            if (a.date > b.date){
                return -1;
            }
            if (a.date < b.date){
                return 1;
            }
            return 0;
        });
    }
}

jsonContents.articles.tags = [];
let arrrr = jsonContents.articles.tags;
let k = 0;
for (let item of tagMap.entries()) {
    // console.log(item[0], item[1]);
    let obj = {};
    obj.name = item[0];
    obj.data = item[1];
    arrrr[k++] = obj;
}

// jsonContents.articles.tags = Array.from(ss);
// console.log(ss);
// let pageStr = JSON.stringify(jsonContents,null,2);
let pageStr = JSON.stringify(jsonContents);
let jsTem =`/*** date: ${new Date().toLocaleString()} ***/var site = site || {};site.config = ${pageStr};`;

fs.writeFile( path.join( projPath, "assets","v","config.js"), jsTem,function (error) {
    if (error)
    {
        console.log(error);
    }
});
console.log( jsTem );