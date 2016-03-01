define([
        'mustache',
        'oblio/utils/DeviceDetect',
        'oblio/classes/MenuPaginator',
        'greensock/TweenLite.min',
        'greensock/TimelineLite.min',
        'greensock/easing/EasePack.min',
        'greensock/plugins/CSSPlugin.min'
    ], function (Mustache) {

    'use strict';

    var isMobile = oblio.utils.DeviceDetect.isMobile;
    var that;

    var Menu = function (data) {
        this.menuID = data.menuID || '';
        this.verbose = false;

        that = this;

        this.template = (data.template)?data.template:'<a rel="{{{rel}}}" class="{{{className}}}" data-type="{{{type}}}" data-section="{{{link}}}" href="{{{link}}}" target="{{{target}}}" style="position: {{{position}}}; font-size: {{{font-size}}};">{{{label}}}</a>';

        this.elements = {
            el: document.getElementById(data.menuID),
            wrapper: document.getElementById(data.wrapperID),
            paginatorEl: document.getElementById(data.paginatorElID)
        };

        this.menuList = data.menuList;
        this.menuStyle = data.menuStyle;
    };

    function init (current_section) {
        if(this.verbose)console.log('Main Menu | '+this.menuID+' | init');

        this.isHidden = false;

        this.elements.listItems = this.elements.el.getElementsByTagName('li');
        this.elements.selected = $('#menu a[data-section="' + current_section + '"]').addClass('selected')

        this.selectMenuItem(this.elements.selected.data('section'), false);

        this.hide(true);

        this.resize();

    }

    function selectMenuItem (section_name, animate) {
        if(this.verbose)console.log('Main Menu | '+this.menuID+' | selectMenuItem: '+section_name);

        var selected = $(this.elements.el).find('a[data-section="' + section_name + '"]');

        if (selected.length === 0) {
            return;
        }

        if (this.elements.selected[0]) {
            this.elements.selected[0].className = '';
        }

        animate = true;

        if (isMobile) {
            // $('#mainNav').removeClass('open');
        }

        this.elements.selectedID = section_name;
        this.elements.selected = selected;
        this.elements.selected[0].className = 'selected';

    }

    function hide (instant) {
        if(this.verbose)console.log('Main Menu | '+this.menuID+' | hide');

        if (this.isHidden === true) {
            return;
        }

        var duration = 0.5;

        if (instant) {
            duration = 0;
        }

        this.isHidden = true;

        switch (this.menuStyle) {
            case 'horizontal':
                TweenLite.to(this.elements.wrapper, duration, {y: -this.elements.wrapper.offsetHeight + 'px', ease: Power4.easeInOut});
                break;
            case 'vertical':
                TweenLite.to(this.elements.wrapper, duration, {x: -this.elements.wrapper.offsetWidth + 'px', ease: Power4.easeInOut});
                break;
            default:
                console.log('invalid menustyle');
        }
    }

    function openPopUp(e){
        e.preventDefault();
        var vSplit = String(e.target.rel).split(',');
        window.open(vSplit[0], "_blank", "width="+vSplit[1]+", height="+vSplit[2]);
        return false;
    }

    function show (instant) {
        if(this.verbose)console.log('Main Menu | '+this.menuID+' | show');

        if (this.isHidden === false) {
            return;
        }

        var duration = 0.5;

        if (instant) {
            duration = 0;
        }

        this.isHidden = false;

        document.getElementById('mainHeader').style.visibility = 'visible';

        switch (this.menuStyle) {
            case 'horizontal':
                TweenLite.to(this.elements.wrapper, duration, {y: '0px', ease: Power4.easeInOut});
                break;
            case 'vertical':
                TweenLite.to(this.elements.wrapper, duration, {x: '0px', ease: Power4.easeInOut});
                break;
            default:
                console.log('invalid menustyle');
        }
    }

    function resize () {
        if (this.menuPaginator) {
            this.menuPaginator.resize(oblio.settings.windowDimensions.width, oblio.settings.windowDimensions.height);
        }

        if (this.elements === undefined) {
            return;
        }
    }

    Menu.prototype.init = init;
    Menu.prototype.openPopUp = openPopUp;
    Menu.prototype.hide = hide;
    Menu.prototype.show = show;
    Menu.prototype.resize = resize;
    Menu.prototype.selectMenuItem = selectMenuItem;

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.Menu = Menu;

    return oblio.classes.Menu;
});