function MetroGroups(selector, configs) {
    this.selector = selector;
    this.wrapper = $(selector);
    this.defaultConfig=configs;
    const config=this.getConfigFromLocalStorage() || configs;   // 如果有本地数据就读本地的
    this.groups = config.groups;
    this.options = config.options;

    this.init();
}

MetroGroups.prototype = {
    /**
     * 初始化
     */
    init: function () {
        this.tiles=[];
        this.initTileGroups(this.groups, this.options);
        this.initDraggable();
    },

    /**
     * 恢复默认配置
     */
    reset: function () {
        this.groups=this.defaultConfig.groups;
        this.options=this.defaultConfig.options;
        this.init();
        this.saveConfigToLocalStorage();
    },
    
    /**
     * 生成 group 容器
     * @param groups    {Array} group 数据
     * @param config    {Object} 网格整体配置
     */
    initTileGroups: function (groups, config) {
        this.wrapper.empty();
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
            group.grids=[];
            for (let row = 0; row < group.size.row; row++) {
                group.grids[row] = [];
                for (let col = 0; col < group.size.col; col++) {
                    group.grids[row][col] = {tile: null, row: row + 1, col: col + 1};
                }
            }
            this.appendItemToGroup($group.find('.tile-wrapper'), group.tiles, group.grids,index);
            this.initContextMenu()
            this.wrapper.append($group)
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
            let tile = new MetroTile(item,index,this.groups[groupIndex],groupIndex);
            tile.parentMetro=this;
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
     * 创建右键菜单
     */
    initContextMenu :function () {
        $.contextMenu({
            selector: this.selector+' .tile-item',
            callback: function(key, opt) {
                switch (key){
                    case 'small':
                    case 'medium':
                    case 'wide':
                    case 'large':{
                        let tile = this.getTileObjById(opt.$trigger.attr('data-tile-id'));
                        tile.changeSize(key)
                        break;
                    }
                }
            }.bind(this),
            items: {
                "size": {name: "Size",items:{
                    "small":{name:'Small'},
                    "medium":{name:'Medium'},
                    "wide":{name:'Wide'},
                    "large":{name:'Large'}
                }},
                "hide":{name:'Hide'}
            }
        })
    },

    /**
     * 拖拽
     */
    initDraggable :function () {
        let $draggable = $('.tile-item').draggabilly({
            containment: true,
            // handle: '.handle',
        })

        $draggable.on('dragStart', function (e, pointer) {
            $(e.target).parents('.tile-wrapper').addClass('is-dragging');
        })

        $draggable.on('dragEnd', function (e, pointer) {
            // 恢复 拖拽状态 和 移动向量
            $('.tile-wrapper').removeClass('is-dragging');
            $(e.target).css({'left': 0, 'top': 0})

            // 获取当前拖拽位置的网格
            let tileId=$(e.target).attr('data-tile-id');
            let tile=this.tiles.filter(function (item) {return item.id===tileId});
            if(tile.length)tile=tile[0];
            else console.error('在 tile 中没找到这个 id : '+tileId,this.tiles);
            let curRow=tile.row + Math.round(vector.y/this.options.gridWidth);
            let curCol=tile.col + Math.round(vector.x/this.options.gridWidth);

            // 判断出界
            if(curRow<=0 || curCol<=0 || curRow+tile.rowSpan > tile.group.size.row+1 || curCol+tile.colSpan > tile.group.size.col+1)
                return console.log('出界',curRow,curCol,curRow+tile.rowSpan,curCol+tile.colSpan);

            // 判断目标网格位置被占用情况
            let newGrids=this.getGridsInArea(tile.group,curRow,curCol,curRow+tile.rowSpan,curCol+tile.colSpan)
            if(newGrids.some(function (item) {
                return item.tile!==null && item.tile!==tile;
            }))return console.log(newGrids,'被占用');


            // 清空旧位置
            let oldGrids=this.getGridsInArea(tile.group,tile.row,tile.col,tile.row+tile.rowSpan,tile.col+tile.colSpan)
            oldGrids.forEach(function (item,index,array) {
                item.tile=null;
            })

            // 移动
            tile.row=curRow;
            tile.col=curCol;
            tile.setTileCss();
            tile.setTileAttr();

            // 填充新位置的 grid
            newGrids.forEach(function (item,index,array) {
                item.tile=tile;
            })
            tile.freshConfigInGroup();

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
        let curRow=tile.row + Math.round(vector.y/this.options.gridWidth);
        let curCol=tile.col + Math.round(vector.x/this.options.gridWidth);
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
    },

    saveConfigToLocalStorage:function () {
        let config={
            groups:this.groups.map(function (item) {
                return {
                    title:item.title,
                    size:item.size,
                    tiles:item.tiles
                }
            }),
            options:this.options,
        }
        localStorage.setItem('metro'+this.selector,JSON.stringify(config));
    },
    
    getConfigFromLocalStorage:function () {
        const config=localStorage.getItem('metro'+this.selector)
        if(config){
            console.log('metro'+this.selector,'从 local 获取到数据')
            return JSON.parse(config)
        }else {
            console.log('metro'+this.selector,'使用默认配置的数据')
            return false
        }
    }
}
