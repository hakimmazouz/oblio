import Mustache from 'mustache';
import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
import { findAncestor } from 'OblioUtils/utils/findAncestor';
import { Navigation } from 'OblioUtils/classes/Navigation';
import 'OblioUtils/utils/DeviceDetect';

/* main.widgets */

'use strict';

var instance,
    footer = (typeof Footer !== 'undefined') ? Footer.getInstance() : false,
    navigation = Navigation.getInstance(),
    sectionLoader = SectionLoader.getInstance();

var shell = function (el) {
    this.elements = {
        shell: document.getElementById('shell')
    };
};

function init (callbackFn) {
    var sectionOBJ = sectionLoader.returnSectionOBJ('main');

    placeHTML.call(this).then(function () {
        this.ready(callbackFn);
    }.bind(this));
}

function placeHTML () {
    return new Promise (function (resolve, reject) {

        var wrapper = document.getElementById('shell'),
            sectionObj = sectionLoader.getSectionTemplates('main'),
            template = sectionObj.template,
            content = sectionObj.data;

        content.slugify = function () {
            return function (text, render) {
                return render(text)
                    .toLowerCase()
                    .replace(/[^\w ]+/g,'')
                    .replace(/ +/g,'_')
                    ;
            };
        };

        let html = Mustache.render(sectionObj.template, content, sectionObj.partials);
        
        wrapper.innerHTML = html;

        window.requestAnimationFrame(function(){
            resolve();
        }.bind(this));
    });
}

function ready(callbackFn){
    this.initialized = true;

    if (footer) {
        footer.init(function () {
            footer.show(callbackFn);
        });
    } else {
        callbackFn();
    }

    if (oblio.app.dataSrc.widgets.menu && oblio.app.dataSrc.widgets.menu.data.menu) {
        this.setupMenu();
    }

    // this.resize();
}

function setLayout () {
    var w = oblio.settings.windowDimensions.width,
        h = oblio.settings.windowDimensions.height;

    if (w <= 414 && h >= w) {
        oblio.settings.layout = 'narrow';
        return;
    }

    if (h <= 414 && w >= h) {
        oblio.settings.layout = 'short';
        return;
    }

    oblio.settings.layout = 'desktop';
}

function setupMenu(){

    // create menu
    var menuData = {
        menuID: 'menu',
        wrapperID: 'mainHeader',
        paginatorElID: 'mainNav',
        menuStyle: oblio.app.dataSrc.widgets.menu.data.menu.style,
        menuAlignment: oblio.app.dataSrc.widgets.menu.data.menu.alignment,
        menuList: oblio.app.dataSrc.widgets.menu.data.menu.links
    };

    var menuTemplate = document.getElementById('menuTemplate');
    if (menuTemplate) menuData.template = menuTemplate.innerHTML;
    
    oblio.app.mainMenu = (typeof Menu !== 'undefined') ? Menu.getNew(menuData) : false;
    if (!oblio.app.mainMenu) return;

    oblio.app.mainMenu.init(navigation.currentSection);

    document.getElementById('menu').addEventListener('click', function (e) {

        var el = findAncestor(e.target, 'a');

        // for links defined as external in json
        if (!el || el.getAttribute('target') === '_blank') {
            return;
        }

        if (el.getAttribute('data-popup')) {
            oblio.app.mainMenu.openPopUp(e);
            return;
        }

        e.preventDefault();

        var section_name = el.getAttribute('data-section');

        if (el.getAttribute('data-type') === 'overlay') {
            oblio.functions.showOverlay(section_name);
        } else {
            navigation.changeSection(section_name);
        }
    }, false);
}

function resize(w, h, top){
    if(!this.initialized)return;

    oblio.settings.windowDimensions = {
        width: w,
        height: h
    };

    setLayout();

    this.elements.shell.style.width = w + 'px';

    if (!document.documentElement.className.match(/^(?=.*\bipad\b)(?=.*\bios7\b)/)) {
        this.elements.shell.style.height = h + 'px';
    }

    if (oblio.app.mainMenu && oblio.app.mainMenu.elements) {
        oblio.settings.menuWidth = oblio.app.mainMenu.elements.el.offsetWidth;
    }

    oblio.settings.sectionWidth = w;

    if (oblio.sections[navigation.currentSection]) {
        if (oblio.sections[navigation.currentSection].initialized && oblio.sections[navigation.currentSection].resize) {
            oblio.sections[navigation.currentSection].resize(w, h, top);
        }
    }

    if (oblio.app.mainMenu) {
        oblio.settings.menuWidth = oblio.app.mainMenu.resize();
    }

    if (footer) footer.resize();

}

shell.prototype.init = init;
shell.prototype.setLayout = setLayout;
shell.prototype.ready = ready;
shell.prototype.setupMenu = setupMenu;
shell.prototype.resize = resize;

export var Shell = {
    getInstance: function () {
        instance = instance || new shell();
        return instance;
    }
}