/**
 * ihowe@outlook.com
 * author by haroel
 * Created by howe on 2017/4/23.
 */

const fs = require("fs");
const path = require("path");

let articlePath = "/Users/howe/Documents/github-haroel/i/article";

let files = fs.readdirSync(articlePath);
let jsonContents = {};

for (let dir of files)
{
    if(/\d+/.test(dir))
    {
        let dateDir = path.join(articlePath,dir);
        let mdfiles = fs.readdirSync(dateDir);
        jsonContents[dir] = [];
        for (let mdfile of mdfiles)
        {
            let mdContent = fs.readFileSync( path.join( dateDir,mdfile),"utf8" );
            let reg = /\*\s+date:`(\d+)`/gm;
            let arr = reg.exec(mdContent);
            let _date = "";
            if ( !arr )
            {
                _date = Date.now();
                mdContent = "* date:" + _date +"\n"+ mdContent;
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
                return tag.substr(1,tag.length-2);
            });
            jsonContents[dir].push(obj);
        }
    }
}
console.log(JSON.stringify(jsonContents,null,4));

