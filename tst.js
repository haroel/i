let str = "`cocos creator` `ezplugin` `js` `objc` `java`";

let arr = str.match(/[^`]+/g);
console.log(arr);