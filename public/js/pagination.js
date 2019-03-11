/**
 * 定义分页器（bootstrap框架）
 * 总页数小于5页逐页添加，大于5页生成当前页为中心的前后共5页
 * 添加至ul.pagination
 * nowpage和endpage以0为起点
 */
function pagination(nowpage,percount,count,reqFunc){
    var endpage=Math.ceil(count/percount)-1;

    $('.pagination').empty();
    if(endpage<6){
        $('<li class="page-item"><a class="page-link" href="javascript:;">上一页</a></li>').appendTo('.pagination');
        for(var i=0;i<=endpage;i++){
            $('<li class="page-item"><a class="page-link" href="javascript:;">'+(i+1)+'</a></li>').appendTo('.pagination');
        }
        $('<li class="page-item"><a class="page-link" href="javascript:;">下一页</a></li>').appendTo('.pagination');
    }else if(endpage==6){
        if(nowpage<=3){
            $('<li class="page-item"><a class="page-link" href="javascript:;">上一页</a></li>').appendTo('.pagination');
            for(var i=0;i<5;i++){
                $('<li class="page-item"><a class="page-link" href="javascript:;">'+(i+1)+'</a></li>').appendTo('.pagination');
            }
            $('<li class="page-item"><a class="page-link" href="javascript:;">...</a></li>').appendTo('.pagination');
            $('<li class="page-item"><a class="page-link" href="javascript:;">'+(endpage+1)+'</a></li>').appendTo('.pagination');
            $('<li class="page-item"><a class="page-link" href="javascript:;">下一页</a></li>').appendTo('.pagination');
        }else{
            $('<li class="page-item"><a class="page-link" href="javascript:;">上一页</a></li>').appendTo('.pagination');
            $('<li class="page-item"><a class="page-link" href="javascript:;">1</a></li>').appendTo('.pagination');
            $('<li class="page-item"><a class="page-link" href="javascript:;">...</a></li>').appendTo('.pagination');
            for(var i=nowpage-4;i<=endpage;i++){
                $('<li class="page-item"><a class="page-link" href="javascript:;">'+(i+1)+'</a></li>').appendTo('.pagination');
            }

            $('<li class="page-item"><a class="page-link" href="javascript:;">下一页</a></li>').appendTo('.pagination');
        }
    }else{
        if(nowpage<=3){
            $('<li class="page-item"><a class="page-link" href="javascript:;">上一页</a></li>').appendTo('.pagination');
            for(var i=0;i<5;i++){
                $('<li class="page-item"><a class="page-link" href="javascript:;">'+(i+1)+'</a></li>').appendTo('.pagination');
            }
            $('<li class="page-item"><a class="page-link" href="javascript:;">...</a></li>').appendTo('.pagination');
            $('<li class="page-item"><a class="page-link" href="javascript:;">'+(endpage+1)+'</a></li>').appendTo('.pagination');
            $('<li class="page-item"><a class="page-link" href="javascript:;">下一页</a></li>').appendTo('.pagination');
        }else if(nowpage>=(endpage-2)){
            $('<li class="page-item"><a class="page-link" href="javascript:;">上一页</a></li>').appendTo('.pagination');
            $('<li class="page-item"><a class="page-link" href="javascript:;">1</a></li>').appendTo('.pagination');
            $('<li class="page-item"><a class="page-link" href="javascript:;">...</a></li>').appendTo('.pagination');
            for(var i=endpage-4;i<=endpage;i++){
                $('<li class="page-item"><a class="page-link" href="javascript:;">'+(i+1)+'</a></li>').appendTo('.pagination');
            }
            $('<li class="page-item"><a class="page-link" href="javascript:;">下一页</a></li>').appendTo('.pagination');
        }else{
            $('<li class="page-item"><a class="page-link" href="javascript:;">上一页</a></li>').appendTo('.pagination');
            $('<li class="page-item"><a class="page-link" href="javascript:;">1</a></li>').appendTo('.pagination');
            $('<li class="page-item"><a class="page-link" href="javascript:;">...</a></li>').appendTo('.pagination');
            for(var i=nowpage-2;i<=nowpage+2;i++){
                $('<li class="page-item"><a class="page-link" href="javascript:;">'+(i+1)+'</a></li>').appendTo('.pagination');
            }
            $('<li class="page-item"><a class="page-link" href="javascript:;">...</a></li>').appendTo('.pagination');
            $('<li class="page-item"><a class="page-link" href="javascript:;">'+(endpage+1)+'</a></li>').appendTo('.pagination');
            $('<li class="page-item"><a class="page-link" href="javascript:;">下一页</a></li>').appendTo('.pagination');
        }
    }

    $('.page-link').each(function(){
        var text=parseInt($(this).html());

        //给翻页器添加active效果
        if(text==(nowpage+1)){
            $(this).parent().addClass('active');
        }


        if(nowpage<=0){
            $('.page-item').each(function(){
                var text=$(this).children().html();
                if(text=='上一页'){
                    $(this).addClass('disabled ');
                }
            });
        }else if(nowpage>=endpage){
            $('.page-item').each(function(){
                var text=$(this).children().html();
                if(text=='下一页'){
                    $(this).addClass('disabled ');
                }
            });
        }
    });

    $('.page-link').on('click',function(){
        var text=$(this).html();
        if(text=='上一页'){
            if(nowpage>0){
                nowpage--;
            }
        }else if(text=='下一页'){
            if(nowpage<endpage){
                nowpage++;
            }
        }else if(text=='...'){
            return;
        }else{
            nowpage=parseInt(text)-1;
        }
        //根据项目情况在此处调用请求新页面的函数
        reqFunc(nowpage,percount,true,true);
    });
}
