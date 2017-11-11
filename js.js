window.onload=function(){
    appendItemToTile([
        {
            title: '用户管理1用户管理2用户管理3用户管理4用户管理',
            size: 'medium',
            bgColor: '',
            textColor: '',
            iconColor: '',
            icon: 'user',
            row: 1,
            col: 1,
        },
        {
            title: '日志管理',
            size: 'small',
            bgColor: '',
            textColor: '',
            iconColor: '',
            icon: 'file',
            row: 1,
            col: 4,
        },
        {
            title: '系统设置',
            size: 'large',
            bgColor: '',
            textColor: '',
            iconColor: '',
            icon: 'cubes',
            row: 3,
            col: 4,
        },
        {
            title: '高级管理',
            size: 'medium',
            bgColor: '',
            textColor: '',
            iconColor: '',
            icon: 'cube',
            row: 5,
            col: 10,
        }
    ]);
    initDraggable();
}

function appendItemToTile(menu){        
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
        var $item = $('<div class="tile-item ' + item.size + '">' +
            '<i class="icon fa fa-' + item.icon + '"></i>' +
            '<div class="name">' + item.title + '</div>' +
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
        $('.tile-wrapper').append($item);
    })
}

function initDraggable(){
    var $draggable = $('.tile-item').draggabilly({
        containment: '.tile-wrapper',
        handle: '.handle',
    })
    
    $draggable.on('dragStart', function (e, pointer) {
        $('.tile-wrapper').addClass('is-dragging');
    })
    
    $draggable.on('dragEnd', function (e, pointer) {
        $('.tile-wrapper').removeClass('is-dragging');
        $(e.target).css({ 'left': 0, 'top': 0 })
    })
}