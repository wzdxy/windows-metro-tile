function MetroTile(config,index,group,groupIndex) {
    this.row=config.row;
    this.col=config.col;
    this.size=config.size;
    this.groupIndex=groupIndex;
    this.index=index;
    this.id=this.groupIndex+'-'+this.index;
    this.group=group;
    this.rowSpan=this.getSizeConfig(config.size).rowSpan;
    this.colSpan=this.getSizeConfig(config.size).colSpan;
    this.$ele = $('<div class="tile-item tile-' + config.size + '"  style="' + (config.background ? "background:" + config.background : '') + '">' +
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
        return this;
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
        return this;
    },
    
    setSize: function (size) {
        switch (size) {
            case 'medium': {
                this.rowSpan = 2;this.colSpan = 2;break;
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
    },
    
    getSizeConfig: function (size) {
        switch (size) {
            case 'medium': {
                return {rowSpan:2,colSpan:2}
            }
            case 'small': {
                return {rowSpan:1,colSpan:1}
            }
            case 'large': {
                return {rowSpan:4,colSpan:4}
            }
            case 'wide': {
                return {rowSpan:2,colSpan:4}
            }
        }
    },
    
    changeSize:function (size) {
        let newSize=this.getSizeConfig(size);
        let newGrids=this.parentMetro.getGridsInArea(this.group,this.row,this.col,+this.row+newSize.rowSpan,this.col+newSize.colSpan)
        if(newGrids.some(function (item) {
            return item.tile!==null && item.tile!==this;
        }.bind(this)))return console.log(newGrids,'被占用');

        // 清空当前 grid 数据
        this.parentMetro.getGridsInArea(this.group,this.row,this.col,this.row+this.rowSpan,this.col+this.colSpan).forEach(function (item) {
            item.tile=null;
        })

        this.size=size;
        this.rowSpan=newSize.rowSpan
        this.colSpan=newSize.colSpan

        // 重设 DOM 的属性
        this.setTileCss().setTileAttr()
        this.$ele.removeClass('tile-medium tile-small tile-large tile-wide').addClass('tile-'+size);
        // 重设新的 grid 中的数据
        this.parentMetro.getGridsInArea(this.group,this.row,this.col,this.row+this.rowSpan,this.col+this.colSpan).forEach(function (item) {
            item.tile=this;
        }.bind(this))
        // 刷新 group 中的配置
        this.freshConfigInGroup();
    },
    freshConfigInGroup:function () {
        Object.assign(this.group.tiles[this.index],{
            size: this.size,
            // background: this.background,
            // textColor: this.textColor,
            // iconColor: '',
            // icon: 'user',
            row: this.row,
            col: this.col,
        })
    }
}