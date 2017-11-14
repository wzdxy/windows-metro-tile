function MetroTile(config,index,group,groupIndex) {
    this.row=config.row;
    this.col=config.col;
    this.rowSpan = 2;
    this.colSpan = 2;       // 默认尺寸
    this.groupIndex=groupIndex;
    this.index=index;
    this.id=this.groupIndex+'-'+this.index;
    this.group=group;
    this.changeSize(config.size);
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
    changeSize:function (size) {
        if(this.$ele){
            // 清空当前 grid 数据
            this.parentMetro.getGridsInArea(this.group,this.row,this.col,this.row+this.rowSpan,this.col+this.colSpan).forEach(function (item,index,array) {
                item.tile=null;
            })
        }
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
        if(this.$ele){
            // 重设 DOM 的属性
            this.setTileCss().setTileAttr()
            this.$ele.removeClass('tile-medium tile-small tile-large tile-wide').addClass('tile-'+size);
            // 重设新的 grid 中的数据
            this.parentMetro.getGridsInArea(this.group,this.row,this.col,this.row+this.rowSpan,this.col+this.colSpan).forEach(function (item) {
                item.tile=this;
            }.bind(this))
            // 添加

        }
    }
}