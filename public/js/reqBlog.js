function reqBlog(nowpage,percount,emptyflag,isNeedPagination) {

    var data={
        page:nowpage,
        percount:percount
    }

    $.post('/loadBlog',data,function (json) {
        console.log(json);
        loadLastBlog(json,emptyflag);
        //添加分页器，要先引入或定义分页器函数pagination
        if(isNeedPagination){
            pagination(nowpage,percount,json.count,reqBlog);
        }
    });
}