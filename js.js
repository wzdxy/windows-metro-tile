window.onload=function(){
    window.gridConfig={
        gridWidth:50
    }
    window.groups=[
        {
            name:'',
            tiles:[],
            ele:null,            
            size:{col:12,row:9},
            grids:[
                [
                    {tile:null},{tile:null},{tile:null},{tile:null},
                ],[
                    {tile:null},{tile:null},{tile:null},{tile:null},
                ],[],[]
            ]
        }
    ]
    appendItemToGroup([
        {
            title: '用户管理1',
            href:'user',
            size: 'medium',
            background: '',
            textColor: '',
            iconColor: '',
            icon: 'user',
            row: 1,
            col: 1,
        },
        {
            title: '日志管理1',
            href:'log',
            size: 'small',
            background: '',
            textColor: '',
            iconColor: '',
            icon: 'file',
            row: 1,
            col: 4,
        },
        {
            title: '系统设置1',
            href:'setting',
            size: 'large',
            background: '',
            textColor: '',
            iconColor: '',
            icon: 'cubes',
            row: 3,
            col: 4,
        },
        {
            title: '高级管理1',
            href:'adv',
            size: 'medium',
            background: 'green',
            textColor: '',
            iconColor: '',
            icon: 'cube',
            row: 5,
            col: 10,
        }
    ],$('.tile-wrapper')[0]);
    appendItemToGroup([
        {
            title: '用户管理2',
            href:'user',
            size: 'medium',
            background: 'gray',
            textColor: '',
            iconColor: '',
            icon: 'user',
            row: 1,
            col: 1,
        },
        {
            title: '日志管理2',
            href:'log',
            size: 'small',
            background: '',
            textColor: '',
            iconColor: '',
            icon: 'file',
            row: 1,
            col: 4,
        },
        {
            title: '系统设置2',
            href:'setting',
            size: 'large',
            background: '',
            textColor: '',
            iconColor: '',
            icon: 'cubes',
            row: 3,
            col: 4,
        },
        {
            title: '高级管理2',
            href:'adv',
            size: 'medium',
            background: 'green',
            textColor: '',
            iconColor: '',
            icon: 'cube',
            row: 5,
            col: 10,
        }
    ],$('.tile-wrapper')[1]);
    initDraggable();
}

function appendItemToGroup(menu,$group){        
    menu.forEach(function (item, index) {
        var rowSpan = 2, colSpan = 2;
        switch (item.size) {
            case 'medium': {
                break;
            }
            case 'small': {
                rowSpan = 1; colSpan = 1; break;
            }
            case 'large': {
                rowSpan = 4; colSpan = 4; break;
            }
        }
        var $item = $('<div class="tile-item ' + item.size + '"  style="'+(item.background?"background:"+item.background:'')+'">' +
            '<a href="'+item.href+'">'+
                '<i class="icon fa fa-' + item.icon + '" style="'+(item.iconColor?"color:"+item.iconColor:'')+'"></i>' +
                '<div class="name" style="'+(item.textColor?"color:"+item.textColor:'')+'">' + item.title + '</div>' +            
            '</a>'+
            '<div class="handle">=</div>' +
            '</div>')
        $item.css({
            "grid-row": item.row + "/" + (item.row + rowSpan),
            "grid-column": item.col + "/" + (item.col + colSpan),
            "-ms-grid-row": String(item.row),
            "-ms-grid-row-span": String(rowSpan),
            "-ms-grid-column": String(item.col),
            "-ms-grid-column-span": String(colSpan),
        })
        $($group).append($item);
    })
}

function initDraggable(){
    var $draggable = $('.tile-item').draggabilly({
        // containment: '.tile-wrapper',
        handle: '.handle',
    })
    
    $draggable.on('dragStart', function (e, pointer) {
        $('.tile-wrapper').addClass('is-dragging');
    })
    
    $draggable.on('dragEnd', function (e, pointer) {
        $('.tile-wrapper').removeClass('is-dragging');
        $(e.target).css({ 'left': 0, 'top': 0 })
    })

    $draggable.on('dragMove',function (e, pointer,vector){
        console.log(arguments);
        
    })
}