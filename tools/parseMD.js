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
    img:"http://tva4.sinaimg.cn/crop.0.0.180.180.180/6d0d5ef5jw1e8qgp5bmzyj2050050aa8.jpg",
    name:'ihowe',
    email:'ihowe@outlook.com',
    address:"现居武汉",
    des:"也可能是最好的三流程序员。"
};
jsonContents.menus = ["最新","分类","演示","其他","关于"];

let articlePath = path.join( projPath ,"article" );
let files = fs.readdirSync(articlePath);
jsonContents.articles = {};
jsonContents.articles.pages = {};
jsonContents.articles.pages["0"] =
[{
    title:"关于",
    file:"about.md"
}];
let ss = new Set();
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
            mdContent = mdContent.split("---")[0];
            let obj = {};
            obj.date = _date;
            obj.file = dir + "/" + mdfile;
            obj.title = /\*\s+title:`([^`]+)`/gm.exec(mdContent)[1];
            let _tags = /\*\s+tags:([^\n]+)/gm.exec(mdContent)[1];
            obj.tags = _tags.split(",").map( function ( tag ) {
                tag = tag.substr(1,tag.length-2);
                ss.add(tag);
                return tag;
            });
            jsonContents.articles.pages[dir].push(obj);
        }
    }
}
jsonContents.articles.tags = Array.from(ss);
// console.log(ss);
let pageStr = JSON.stringify(jsonContents,null,4);

let jsTem =`
    /*** date: ${new Date().toLocaleString()} ***/
    var site = site || {};
    site.config = ${pageStr}
`;

fs.writeFile( path.join( projPath, "assets","v","config.js"), jsTem,function (error) {
    if (error)
    {
        console.log(error);
    }
});

console.log( jsTem );

