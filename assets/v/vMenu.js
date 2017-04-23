/**
 * Created by howe on 2017/3/18.
 */

var site = site || {};
site.menuside = new Vue({
    el:'.menu-wrap',
    data:
    {
        author:site.config.author,
        tags:["最新","分类","演示","其他","关于"]
    },
    created:function ()
    {
    },
    methods:{
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
                    break;
                }

            }
            console.log(event.target.outerText);
            
        }
    }
    


});