function loadUserInfo(json,emptyflag) {


    var template=$("#UserInfo-temp").html();
    var $row=$('#last-wrap');
    if(emptyflag){
        $row.empty();
    }

    if(json.error==0){
        if(json.docs.length>0){
            for(var i=0;i<json.docs.length;i++){
                var html=template.replace(/@(\w+)@/ig,function (match,$key) {
                    return json.docs[i][$key];
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

