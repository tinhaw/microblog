function loadLastBlog(json,emptyflag) {

    Date.prototype.Format = function(fmt)
    {
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
        };
        if(/(y+)/.test(fmt))
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
    }

    var template=$("#blog-temp").html();
    var $row=$('#last-wrap');
    if(emptyflag){
        $row.empty();
    }

    if(json.error==0){
        if(json.result.length>0){
            for(var i=0;i<json.result.length;i++){
                json.result[i].date=new Date(json.result[i].date).Format('yyyy-MM-dd hh:mm:ss');
                var html=template.replace(/@(\w+)@/ig,function (match,$key) {
                    return json.result[i][$key];
                });
                $(html).appendTo($row);
            }
        }else{
            var html='<div class="col-sm-12"><h3 class="text-center text-light bg-secondary">没有新的内容</h3></div>';
            $(html).appendTo($row);
        }
    }else{
        var html='<div class="col-sm-12"><h3 class="text-center text-light bg-secondary">读取数据失败</h3></div>';
        $(html).appendTo($row);
    }
}

