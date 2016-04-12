define([], function () {
    function Scrollbar ( root, options )
        {

            this.options = {
                    axis         : options.y || 'y'    // vertical or horizontal scrollbar? ( x || y ).
                ,   wheel        : options.wheel || 40     // how many pixels must the mouswheel scroll at a time.
                ,   scroll       : options.scroll !== undefined ? options.scroll : true   // enable or disable the mousewheel.
                ,   lockscroll   : options.lockscroll !== undefined ? options.lockscroll : true   // return scrollwheel to browser if there is no more content.
                ,   size         : options.size || 'auto' // set the size of the scrollbar to auto or a fixed number.
                ,   sizethumb    : options.sizethumb || 'auto' // set the size of the thumb to auto or a fixed number.
                ,   invertscroll : options.invertscroll !== undefined ? options.invertscroll : false  // Enable mobile invert style scrolling
            };

            // var oSelf       = this
            this.oWrapper    = root;
            this.oViewport   = { obj: this.oWrapper.querySelector( '.viewport' ) };
            this.oContent    = { obj: this.oWrapper.querySelector( '.overview' ) };
            this.oScrollbar  = { obj: this.oWrapper.querySelector( '.scrollbar' ) };
            this.oTrack      = { obj: this.oWrapper.querySelector( '.track' ) };
            this.oThumb      = { obj: this.oWrapper.querySelector( '.thumb' ) };
            this.sAxis       = this.options.axis === 'x';
            this.sDirection  = this.sAxis ? 'x' : 'y';
            this.sSize       = this.sAxis ? 'Width' : 'Height';
            this.iScroll     = 0;
            this.iPosition   = { start: 0, now: 0 };
            this.iMouse      = {};
            this.touchEvents = 'ontouchstart' in document.documentElement;

            this.update();
            setEvents.call(this);
        }

    function init () {
    }

    function update ( sScroll ) {
        this.oViewport[ this.options.axis ] = this.oViewport.obj[ 'offset' + this.sSize ];
        this.oContent[ this.options.axis ] = this.oContent.obj[ 'scroll'+ this.sSize ];
        this.oContent.ratio = this.oViewport[ this.options.axis ] / this.oContent[ this.options.axis ];

        this.oScrollbar.obj.classList.toggle( 'disable', this.oContent.ratio >= 1);

        this.oTrack[ this.options.axis ] = this.options.size === 'auto' ? this.oViewport[ this.options.axis ] : this.options.size;
        this.oThumb[ this.options.axis ] = Math.min( this.oTrack[ this.options.axis ], Math.max( 0, ( this.options.sizethumb === 'auto' ? ( this.oTrack[ this.options.axis ] * this.oContent.ratio ) : this.options.sizethumb ) ) );

        this.oScrollbar.ratio = this.options.sizethumb === 'auto' ? ( this.oContent[ this.options.axis ] / this.oTrack[ this.options.axis ] ) : ( this.oContent[ this.options.axis ] - this.oViewport[ this.options.axis ] ) / ( this.oTrack[ this.options.axis ] - this.oThumb[ this.options.axis ] );
        
        this.iScroll = ( sScroll === 'relative' && oContent.ratio <= 1 ) ? Math.min( ( oContent[ options.axis ] - oViewport[ options.axis ] ), Math.max( 0, this.iScroll )) : 0;
        this.iScroll = ( sScroll === 'bottom' && oContent.ratio <= 1 ) ? ( oContent[ options.axis ] - oViewport[ options.axis ] ) : isNaN( parseInt( sScroll, 10 ) ) ? this.iScroll : parseInt( sScroll, 10 );
        
        setSize.call(this);
    };

    function setSize () {
        var sCssSize = this.sSize.toLowerCase();

        var thumbobj = {
                z: '1px'
            };

        thumbobj[this.sDirection] = (this.iScroll / this.oScrollbar.ratio) + 'px';
        TweenLite.set(this.oThumb.obj, thumbobj);
        // oThumb.obj.css( sDirection, iScroll / oScrollbar.ratio );

        var contentobj = {
                z: '1px'
            };
        contentobj[this.sDirection] = -this.iScroll + 'px';
        TweenLite.set(this.oContent.obj, contentobj);
        this.iMouse.start = this.oThumb.obj['offset' + this.sDirection];

        this.oScrollbar.obj.style[sCssSize] = this.oTrack[ this.options.axis ];
        this.oTrack.obj.style[sCssSize] = this.oTrack[ this.options.axis ];
        this.oThumb.obj.style[sCssSize] = this.oThumb[ this.options.axis ];
    }

    function setEvents () {
        if ( ! this.touchEvents ) {
            this.oThumb.obj.addEventListener( 'mousedown', start.bind(this), false );
            this.oTrack.obj.addEventListener( 'mouseup', drag.bind(this), false );
        } else {
            this.oViewport.obj.addEventListener('touchstart', function (e) {   
                this.options.invertscroll = true;

                if ( 1 === e.touches.length ) {
                    start.call(this, e.touches[0] );
                    e.stopPropagation();
                }
            }.bind(this));

            this.oViewport.obj.addEventListener('touchstart', function (e) {   
                this.options.invertscroll = false;

                if ( 1 === e.touches.length ) {
                    start( e.touches[0] );
                    e.stopPropagation();
                }
            }.bind(this));

        }

        if ( this.options.scroll ) {
            this.oWrapper.addEventListener( 'DOMMouseScroll', wheel.bind(this), false );
            this.oWrapper.addEventListener( 'mousewheel', wheel.bind(this), false );
            this.oWrapper.addEventListener( 'MozMousePixelScroll', function (e){
                e.preventDefault();
            }, false);
        }
    }

    function start (e) {
        document.body.className = document.body.className + ' noSelect';

        this.iMouse.start    = this.sAxis ? e.pageX : e.pageY;
        this.iPosition.start = (this.iScroll / this.oScrollbar.ratio);
        
        if( !this.touchEvents )
        {
            document.addEventListener( 'mousemove', drag.bind(this), false );
            document.addEventListener( 'mouseup', end.bind(this), false );
            this.oThumb.obj.addEventListener( 'mouseup', end.bind(this), false );
        }
        else
        {
            document.addEventListener('touchmove', function (e) {
                e.preventDefault();
                drag.call(this, e.touches[0]);
            }.bind(this), false);

            document.addEventListener('touchend', end.bind(this), false);    
        }
    }

    function wheel (e) {
        if ( this.oContent.ratio < 1 ) {
            var oEvent = e || window.event
            ,   iDelta = oEvent.wheelDelta ? oEvent.wheelDelta / 120 : -oEvent.detail / 3
            ;

            this.iScroll -= iDelta * this.options.wheel;
            this.iScroll = Math.min( ( this.oContent[ this.options.axis ] - this.oViewport[ this.options.axis ] ), Math.max( 0, this.iScroll ));

            var thumbobj = {
                z: '1px'
            };
            thumbobj[this.sDirection] = (this.iScroll / this.oScrollbar.ratio) + 'px';
            TweenLite.set(this.oThumb.obj, thumbobj);
            // oThumb.obj.css( sDirection, iScroll / oScrollbar.ratio );

            var contentobj = {
                z: '1px'
            };
            contentobj[this.sDirection] = -this.iScroll + 'px';
            TweenLite.set(this.oContent.obj, contentobj);
            // oContent.obj.css( sDirection, -iScroll );

            if ( this.options.lockscroll || ( this.iScroll !== ( this.oContent[ this.options.axis ] - this.oViewport[ this.options.axis ] ) && this.iScroll !== 0 ) ) {
                oEvent.preventDefault();
            }
        }
    }

    function drag (e) {
        if ( this.oContent.ratio < 1 ) {
            if ( this.options.invertscroll && this.touchEvents ) {
                this.iPosition.now = Math.min( ( this.oTrack[ this.options.axis ] - this.oThumb[ this.options.axis ] ), Math.max( 0, ( this.Position.start + ( this.iMouse.start - ( this.sAxis ? e.pageX : e.pageY ) ))));
            } else {
                 this.iPosition.now = Math.min( ( this.oTrack[ this.options.axis ] - this.oThumb[ this.options.axis ] ), Math.max( 0, ( this.iPosition.start + ( ( this.sAxis ? e.pageX : e.pageY ) - this.iMouse.start))));
            }

            this.iScroll = this.iPosition.now * this.oScrollbar.ratio;

            var thumbobj = {
                z: '1px'
            };
            thumbobj[this.sDirection] = (this.iPosition.now) + 'px';
            TweenLite.set(this.oThumb.obj, thumbobj);

            var contentobj = {
                z: '1px'
            };
            contentobj[this.sDirection] = -this.iScroll + 'px';
            TweenLite.set(this.oContent.obj, contentobj);
        }
    }

    function end () {
        document.body.classList.remove('noSelect');
        document.removeEventListener( 'mousemove', drag.bind(this) );
        document.removeEventListener( 'mouseup', end.bind(this) );
        this.oThumb.obj.removeEventListener( 'mouseup', end.bind(this) );
        // document.removeEventListener('touchmove');
        // document.removeEventListener('touchend');
    }

    Scrollbar.prototype.init = init;
    Scrollbar.prototype.update = update;

    return Scrollbar;
});