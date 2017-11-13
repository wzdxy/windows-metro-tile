window.onload = function () {
    window.metro=new MetroGroups($('#main-wrapper'), groups, {gridWidth: 50});
    console.log(metro);
}

function MetroGroups($wrapper, groups, config) {
    this.wrapper = $wrapper;
    this.groups = groups;
    this.config = config;
    this.tiles=[];
    this.init();
}

function MetroTile(config,index,group,groupIndex,) {
    this.row=config.row;
    this.col=config.col;
    this.rowSpan = 2;
    this.colSpan = 2;       // 默认尺寸
    this.groupIndex=groupIndex;
    this.index=index;
    this.id=this.groupIndex+'-'+this.index;
    this.group=group;
    switch (config.size) {
        case 'medium': {
            break;
        }
        case 'small': {
            this.rowSpan = 1;this.colSpan = 1;break;
        }
        case 'large': {
            this.rowSpan = 4;this.colSpan = 4;break;
        }
        case 'wide': {
            this.rowSpan = 2;this.colSpan = 4;break;
        }
    }
    this.$ele = $('<div class="tile-item ' + config.size + '"  style="' + (config.background ? "background:" + config.background : '') + '">' +
        '<a href="' + config.href + '">' +
        '<i class="icon fa fa-' + config.icon + '" style="' + (config.iconColor ? "color:" + config.iconColor : '') + '"></i>' +
        '<div class="name" style="' + (config.textColor ? "color:" + config.textColor : '') + '">' + config.title + '</div>' +
        '</a>' +
        '<div class="handle">=</div>' +
        '</div>');
    this.setTileCss();
    this.setTileAttr();
}
MetroTile.prototype={
    setTileCss:function () {
        this.$ele.css({
            "grid-row": this.row + "/" + (this.row + this.rowSpan),
            "grid-column": this.col + "/" + (this.col + this.colSpan),
            "-ms-grid-row": String(this.row),
            "-ms-grid-row-span": String(this.rowSpan),
            "-ms-grid-column": String(this.col),
            "-ms-grid-column-span": String(this.colSpan),
        })
    },
    setTileAttr:function () {
        this.$ele.attr({
            'data-grid-row':this.row,
            'data-grid-col':this.col,
            'data-row-span':this.rowSpan,
            'data-col-span':this.colSpan,
            'data-group-index':this.groupIndex,
            'data-tile-id':this.id
        })
    }
}

MetroGroups.prototype = {
    /**
     * 初始化
     */
    init: function () {
        this.initTileGroups($('#main-wrapper'), groups, {gridWidth: 50});
        this.initDraggable();
    },

    /**
     * 生成 group 容器
     * @param $wrapper  容器 $jquery 对象
     * @param groups    {Array} group 数据
     * @param config    {Object} 网格整体配置
     */
    initTileGroups: function ($wrapper, groups, config) {
        groups.forEach(function (group,index) {
            const $group = $(
                '<div class="tile-group" >' +
                '<div class="tile-group-title">' + group.title + '</div>' +
                '<div class="tile-wrapper"></div>' +
                '</div>')
            $group.css({
                'grid-template-columns': 'repeat(' + group.size.col + ', ' + config.gridWidth + 'px)',
                'grid-template-rows': 'repeat(' + group.size.row + ', ' + config.gridWidth + 'px)',
                'grid-auto-rows': config.gridWidth + 'px',
                '-ms-grid-columns': (config.gridWidth + 'px ').repeat(group.size.col),
                '-ms-grid-rows': (config.gridWidth + 'px ').repeat(group.size.row),
            })
            $group.attr({
                'data-group-index':index
            })
            for (let row = 0; row < group.size.row; row++) {
                group.grids[row] = [];
                for (let col = 0; col < group.size.col; col++) {
                    group.grids[row][col] = {tile: null, row: row + 1, col: col + 1};
                }
            }
            this.appendItemToGroup($group.find('.tile-wrapper'), group.tiles, group.grids,index);
            $wrapper.append($group)
            group.ele = $group
        }.bind(this))
    },

    /**
     * 把磁贴添加到 $group 容器
     * @param tiles
     * @param $group
     * @param grids
     * @param groupIndex
     */
    appendItemToGroup :function ($group, tiles, grids, groupIndex) {
        tiles.forEach(function (item, index) {
            let tile = new MetroTile(item,index,this.groups[groupIndex],groupIndex,);
            for (let row = tile.row; row < tile.row + tile.rowSpan; row++) {
                for (let col = tile.col; col < tile.col + tile.colSpan; col++) {
                    grids[row - 1][col - 1].tile = tile;
                }
            }
            $($group).append(tile.$ele);
            this.tiles.push(tile);
        }.bind(this))
    },

    /**
     * 拖拽
     */
    initDraggable :function () {
        let $draggable = $('.tile-item').draggabilly({
            // containment: '.tile-wrapper',
            handle: '.handle',
        })

        $draggable.on('dragStart', function (e, pointer) {
            $('.tile-wrapper').addClass('is-dragging');
        })

        $draggable.on('dragEnd', function (e, pointer) {

            // 获取当前拖拽位置的网格
            let tileId=$(e.target).attr('data-tile-id');
            let tile=this.tiles.filter(function (item) {return item.id===tileId});
            if(tile.length)tile=tile[0];
            else console.error('在 tile 中没找到这个 id : '+tileId,this.tiles);
            let curRow=tile.row + Math.round(vector.y/this.config.gridWidth);
            let curCol=tile.col + Math.round(vector.x/this.config.gridWidth);
            let curGrids=this.getGridsInArea(tile.group,curRow,curCol,curRow+tile.rowSpan,curCol+tile.colSpan)
            // 判断网格位置被占用情况

            // 移动
            tile.row=curRow;
            tile.col=curCol;
            tile.setTileCss();

            // 恢复 拖拽状态 和 移动向量
            $('.tile-wrapper').removeClass('is-dragging');
            $(e.target).css({'left': 0, 'top': 0})
        }.bind(this))

        $draggable.on('dragMove', function (e, pointer, vector) {
            window.vector={
                x:vector.x,
                y:vector.y
            }
        }.bind(this))
    },

    /**
     * 根据位移计算坐标
     * @param ele
     * @param vector
     * @returns {{row: *, col: *}}
     */
    getCurCR:function (ele,vector) {
        let tileId=$(ele).attr('data-tile-id');
        let tile = this.getTileObjById(tileId);
        let curRow=tile.row + Math.round(vector.y/this.config.gridWidth);
        let curCol=tile.col + Math.round(vector.x/this.config.gridWidth);
        return {
            curRow:curRow,curCol:curCol,
            oldRow:tile.row,oldCol:tile.col
        }
    },

    /**
     * 根据 ID 获取 MetroTile 对象
     * @param tileId
     * @returns {Array.<*>}
     */
    getTileObjById:function (tileId) {
        let tile=this.tiles.filter(function (item) {return item.id===tileId});
        if(tile.length)tile=tile[0];
        else return console.error('在 tile 中没找到这个 id : '+tileId,this.tiles);
        return tile;
    },


    /**
     * 获取一个目标区域的所有网格列表
     * @param group
     * @param row1
     * @param col1
     * @param row2
     * @param col2
     * @returns {Array}
     */
    getGridsInArea:function(group,row1,col1,row2,col2){
        let grids=[];
        let startRowIndex=row1-1,startColIndex=col1-1,endRowIndex=row2-1,endColIndex=col2-1;
        for(let i=startRowIndex;i<endRowIndex;i++){
            for(let j=startColIndex;j<endColIndex;j++){
                grids.push(group.grids[i][j])
            }

        }
        return grids
    }

}

