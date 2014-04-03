

require.config({
    paths: {
        jquery: 'lib/jquery-2.1.0.min'
    }
});

require(['globals', 'jquery'], function(globals, $, undefined){
    
    var _id_counter = 0;
    function newID() {
        return _id_counter += 1;
    }
    
    function formatMinutes(total_seconds) {
        var minutes = Math.floor(total_seconds / 60)
          , seconds = Math.floor(total_seconds  % 60)
          ;
        return [
                ('00' + minutes).slice(-2) ,':', 
                ('00' + seconds).slice(-2)
        ].join('');
    }
    
    var Presenter = function(items, document, index) {
        this.current = null;
        this.dom = this.makeSlideList(document, items)
        this.$dom = $(this.dom)
        this.$dom.addClass(this['class'])
        
        // init
        this.goto(index || 0)
    }, _pP = Presenter.prototype;
    
    _pP['class'] = 'presenter'
    _pP.goto = function(index) {
        $(this.dom.children[index]).addClass('active')
        $(this.dom.children[this.current]).removeClass('active')
        this.current = index;
    }
    
    _pP.makeSlide = function(document, slideData) {
        var container = document.createElement('li')
          , url = slideData
          ;
        container.className = 'slide';
        container.setAttribute('style', ['background-image:url(', url, ')'].join(''))
        return container;
    }
    
    _pP.makeSlideList = function(document, slidesData) {
        var container = document.createElement('ol')
          , slides = slidesData
          , i=0
          ;
        container.className = 'slides';
        for(;i<slides.length;i++)
            container.appendChild(this.makeSlide(document, slides[i]));
        return container;
    }
    
    var Thumbnails = function Thumbnails() {
        this.Parent = Presenter;
        this.Parent.apply(this, Array.prototype.slice.call(arguments))
        
        this._draggingStart = false;
        this.$dom.on({
            'mousemove': function(e) {
                e.preventDefault()
                if(!this._draggingStart)
                    return;
                this.$dom.css('cursor', 'row-resize');
                
                this._wasDragged = true;
                
                this.$dom.scrollTop(this._draggingStart.y - e.pageY);
                this.$dom.scrollLeft(this._draggingStart.x - e.pageX);
            }.bind(this),
            'mousedown': function(e) {
                this._wasDragged = false;
                this._draggingStart = {
                    x: this.$dom.scrollLeft() + e.pageX,
                    y: this.$dom.scrollTop() + e.pageY
                };
                
                $(this.dom.ownerDocument).one('mouseup', function(e) {
                if(!this._wasDragged)
                    $(this).trigger(e);
                    this._draggingStart = false;
                    this.$dom.css('cursor', 'auto');
                }.bind(this))
            }.bind(this)
        });
    }, _pT;
    
    Thumbnails.prototype = Object.create(_pP)
    
    _pT = Thumbnails.prototype
    _pT['class'] = 'thumbnails'
    
    _pT._getScrollOffset = function($next) {
        return {left: $next.outerWidth(true) * 3 , top: $next.outerHeight(true) * 3};
    }
    
    _pT.goto = function(index) {
        
        var $next = $(this.dom.children[index])
          , pos = $next.position()
          , offset = this._getScrollOffset($next)
          ;
        
        
        //this.$dom[0]
        this.$dom.stop().animate({
            scrollTop:this.$dom[0].scrollTop + pos.top - offset.top,
            scrollLeft: this.$dom[0].scrollLeft + pos.left - offset.left
        })
        
        this.Parent.prototype.goto.call(this, index)
    }
    
    var Prompter = function Prompter() {
        Thumbnails.apply(this, Array.prototype.slice.call(arguments))
    }, _pPr;
    
    _pPr = Prompter.prototype = Object.create(_pT)
    _pPr['class'] = 'prompter'
    
    _pPr.makeSlide = function(document, slideData) {
        var container = document.createElement('li');
        container.className = 'slide';
        container.innerHTML = slideData;
        return container;
    }
    _pPr._getScrollOffset = function($next){
        return {left: 0, top: 0}  
    }
    
    var Timer = function() {
        this.dom = document.createElement('span');
        this.intervalID = undefined;
        this.offset = 0;
        this._print();
    }, _pTimer = Timer.prototype;
    
    _pTimer._getSeccondsFromStart = function() {
        if(this.started === undefined)
            return 0;
        return Math.round((new Date() - this.started)/1000);
    }
    
    _pTimer._tickHandler = _pTimer._print = function() {
        var total_seconds = this._getSeccondsFromStart() + this.offset;
        this.dom.textContent = formatMinutes(total_seconds);
    }
    
    _pTimer.start = function() {
        if(this.started !== undefined)
            return;
        this.started = new Date()
        this.intervalID = setInterval(this._tickHandler.bind(this), 50)
    }
    
    _pTimer._halt = function(){
        clearInterval(this.intervalID)
        this.intervalID = undefined;
        this.started = undefined;
        this._print();
    }
    
    _pTimer.stop = function() {
        this.offset = 0;
        this._halt();
    }
    
    _pTimer.pause = function() {
        if(this.started === undefined)
            return;
        this.offset += this._getSeccondsFromStart()
        this._halt();
    }
    
    _pTimer.resume = _pTimer.start
    
    _pTimer.togglePlay = function(){
        if(this.started === undefined)
            this.resume();
        else
            this.pause();
        
    }
    
    
    
    var Controller = function(slides, document) {
        this.document = document;
        this._slaves = {};
        this._windows = {}
        this.current = 0
        this.slides =  slides.map(function(item){return item instanceof Array ? item[0] : item;});
        this.prompts = slides.map(function(item){return item instanceof Array && item[1] ? item[1] : '';});
        
        
        this.presenter = new Presenter(this.slides, document);
        this._registerSlaveApi(newID(), this.presenter)
        this.thumbnails = new Thumbnails(this.slides, document);
        this._registerSlaveApi(newID(), this.thumbnails)
        this.prompter = new Prompter(this.prompts, document);
        this._registerSlaveApi(newID(), this.prompter)
        
        
        this.slideTimer = new Timer()
        this.totalTimer = new Timer()
        
        this.state = document.createElement('aside')
        this.state.className = 'indicators';
        
        this._currentSlideIndicator = document.createElement('span')
        this._currentSlideIndicator.textContent = this.current + 1;
        
        this._addIndicator('Slide', this._currentSlideIndicator);
        var totalSlides = document.createElement('span');
        totalSlides.textContent = this.slides.length;
        this._addIndicator('of', totalSlides);
        
        this._addIndicator('Time on Slide', this.slideTimer.dom)
        this._addIndicator('Total Time', this.totalTimer.dom)
        
        this.menu = document.createElement('menu');
        
        
        this._menuAdd('new slave', this._newSlaveHandler.bind(this));
        this._menuAdd('<', this.prev.bind(this));
        this._menuAdd('>', this.next.bind(this));
        
        this._menuAdd('▶/▮▮', this._togglePlayHandler.bind(this));
        this._menuAdd('■', this._stopHandler.bind(this));
        
        // handlers
        $(this.thumbnails).on('mouseup', this._thumbClickHandler.bind(this))
    }, _pC = Controller.prototype;
    
    _pC._thumbClickHandler = function(evt) {
        this.goto($(evt.target).index())
    }
    
    _pC._stopHandler = function(){
        this.slideTimer.stop();
        this.totalTimer.stop();
    }
    _pC._togglePlayHandler = function(){
        this.slideTimer.togglePlay();
        this.totalTimer.togglePlay();
    }
    _pC.goto = function(index) {
        if(this.slides.length === 0)
            return;
        index = Math.min(index, this.slides.length-1);
        index = Math.max(0, index);
        if(index === this.current)
            return;
        
        if(this.slideTimer.started !== undefined) {
            this.slideTimer.stop();
            this.totalTimer.pause();
            this._togglePlayHandler();
        }
        else
            this.slideTimer.stop();
        this.current = index;
        this._currentSlideIndicator.textContent = this.current + 1;
        for(var k in this._slaves)
            this._slaves[k].goto(index)
    }
    _pC.next = function() {
        this.goto(this.current + 1)
    }
    _pC.prev = function(){
        this.goto(this.current + -1)
    }
    _pC._menuAdd = function(label, clickHandler){
        var item = this.document.createElement('button')
        item.appendChild(this.document.createTextNode(label))
        item.addEventListener('click', clickHandler, false);
        this.menu.appendChild(item)
    }
    
    _pC._addIndicator = function(label, element){
        var l = this.document.createElement('em')
        l.className = 'label';
        l.textContent = label;
        this.state.appendChild(l)
        this.state.appendChild(element)
    }
    
    _pC._registerSlaveApi = function(id, api){
        this._slaves[id] = api;
    }
    
    _pC._unregisterSlaveApi = function(id){
        delete this._slaves[id];
    }
    
    _pC._slaveLoadedHandler = function(window, id, evt) {
        var p = new Presenter(this.slides, window.document, this.current);
        window.document.body.appendChild(p.dom);
        this._registerSlaveApi(id, p)
    }
    _pC._slaveBeforeunloadHandler = function(window, id, evt) {
        window.close()
        delete this._windows[id]
        this._unregisterSlaveApi(id)
    }
    _pC._newSlaveHandler = function() {
        var setup = "height=600,width=800,centerscreen=yes,resizable,scrollbars,status"
          , newWin = window.open('slave.html', '_blank', setup)
          , id = newID()
          ;
        this._windows[id] = newWin;
        $(newWin).one('load', this._slaveLoadedHandler.bind(this, newWin, id))
        $(newWin).one('beforeunload', this._slaveBeforeunloadHandler.bind(this, newWin, id))
    }
    _pC.unload = function() {
        for(var id in this._windows)
            this._windows[id].close()
    }
    _pC.keyUpHandler = function(e) {
         switch(e.keyCode) {
            case 35 : this.goto(this.slides.length-1); break;
            case 36 : this.goto(0); break;
            case 37 :
            case 38 :
                this.prev(); break;
            case 32 : //space
            case 39 :
            case 40 :
                this.next(); break;
            //default: alert(e.keyCode); break;
        }
    }
    
    var ctrl = new Controller(globals.slides, document);
    $(window).on('beforeunload', ctrl.unload.bind(ctrl))
    $(function() {
        document.body.appendChild(ctrl.presenter.dom);
        document.body.appendChild(ctrl.prompter.dom);
        document.body.appendChild(ctrl.state);
        document.body.appendChild(ctrl.menu);
        document.body.appendChild(ctrl.thumbnails.dom);
        
        
        $(document).on('keyup', ctrl.keyUpHandler.bind(ctrl))
    })
})
