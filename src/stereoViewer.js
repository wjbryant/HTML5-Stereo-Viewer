/*! stereoViewer v2.0.0-dev | https://github.com/wjbryant/HTML5-Stereo-Viewer
Copyright (c) 2013 Yury Golubinsky | http://creativecommons.org/licenses/by/3.0/ */

var stereover = '2.0.0-dev',
    images = [],
    imagesT = [],
    imagesC = [],
    imageN = 0,
    stereoMode = 5,
    stereoBGcolor = 0,
    stereoMouse = -1,
    stereoNavDef = 0, //30;
    stereoNav = stereoNavDef,
    stereoOptVis = false,
    stereoSwap = false,
    stereoCaption = true,
    stereoCaptionSrc = 'alt',
    stereoDefType = 'stereoRL',
    stereoiOS = false,
    stereoiOS_iPad = false,
    stereoiOS_iPhone = false,
    stereoIE = false,
    stereourl = 'http://urixblog.com/html5-stereo-viewer',
    stereourlvis = 'http://urixblog.com/...',
    stereoModes = 11,
    stereoGlasses = 0,
    sGlassesRedCyan = 0,
    sGlassesGreenMagenta = 1,
    stereoFirstTimeHelpDisplayed = true;

/**
 * Mode       - stereo mode (0..9...). Default: 5
 * Swap       - swap left and right sides (true, false). Default: false
 * BGColor    - backgroung color (0,1,2) for Black, Gray and White. Default: 0
 * Caption    - show captions (true, false). Default: true
 * CaptionSrc - caption text source name ('alt', 'title'). Default: 'alt'
 * Type       - default stereo images type ('anaglyph', 'flat', 'stereoLR', 'stereoRL', ''), for images with class="stereo". The value '' corresponds to 'stereoRL'
 */
function stereoViewerOpen(Mode, Swap, BGColor, Caption, CaptionSrc, Type) {
    var i;

    if (Caption) {
        stereoCaption = Caption;
    }
    if (CaptionSrc !== '') {
        stereoCaptionSrc = CaptionSrc;
    }
    if (Type !== '') {
        stereoDefType = Type;
    }
    if (Mode && Mode >= 0 && Mode <= stereoModes) {
        stereoMode = Mode;
    }
    if (Swap) {
        stereoSwap = Swap;
    }

    stereoiOS_iPhone = (navigator.appVersion.indexOf('iPhone') !== -1) || (navigator.appVersion.indexOf('iPod') !== -1);
    stereoiOS_iPad = (navigator.appVersion.indexOf('iPad') !== -1);
    stereoiOS = stereoiOS_iPad || stereoiOS_iPhone;

    if (stereoiOS) {
        stereoNav = 0;
    }

    stereoIE = (/MSIE (\d+\.\d+);/.test(navigator.userAgent));

    if (document.getElementById('stereoViewer')) {
        document.body.insertBefore(document.getElementById('stereoViewer'), document.body.firstChild);
        document.body.removeChild(document.getElementById('stereoViewer'));
    }

    var div = document.createElement('div');
    div.id = 'stereoViewer';
    div.style.position = 'fixed';
    div.style.zIndex = 999990;
    div.style.top = 0;
    div.style.left = 0;
    div.style.backgroundColor = '#000';
    div.style.visibility = 'visible';
    div.style.fontFamily = 'arial,verdana,helvetica';

    div.innerHTML =
        '<div id="stereoCanvasdiv" style="" onmouseover="stereoDrawControls(event)" onmousemove="stereoDrawControls(event);" onmouseout="stereoDrawControls(event);" onmouse="stereoDrawControls(event);" onclick="stereoMouseClick(event);" ondblclick="if (stereoiOS) stereoViewerOptionsOpen(!stereoOptVis);" >' +
            '<canvas id="stereoCanvas"></canvas>' +
        '</div>' +
        '<div id="stereoControls" style="z-index:2; position:fixed; background-color:#fff; opacity:.9; padding:16px; margin:0px; border:1px; border-style:solid; border-color:black; visibility:hidden; left:16px; top:16px;' +
                '-moz-box-shadow: 1px 4px 10px rgba(68,68,68,0.6);' +
                '-webkit-box-shadow: 1px 4px 10px rgba(68,68,68,0.6);' +
                'box-shadow: 1px 4px 10px rgba(68,68,68,0.6);' +
                'filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius=3,MakeShadow=true,ShadowOpacity=0.30);' +
                '-ms-filter: "progid:DXImageTransform.Microsoft.Blur(PixelRadius=3,MakeShadow=true,ShadowOpacity=0.30)";">' +
            '<!--input type="button" value="Save As (FF only)" onclick="stereoSaveAs();" /><br /-->' +
            '<center>' +
            '<input type="button" value="Close Viewer" onclick="stereoViewerClose();" />' +
            '<input type="button" value="Help" onclick="stereoHelpOpen();" />' +
            '<input type="button" value="?" onclick="stereoAboutOpen();" /></center>' +
            '<hr /><br />' +
            '<b>Mode:</b><br /><br />' +
            '<select onchange="stereoModeChange(0);" id="modeselect">' +
            '<option>Right Left (0)</option>' +
            '<option>Left Right (1)</option>' +
            '<option>Left (2)</option>' +
            '<option>Right (3)</option>' +
            '<option>Color Anaglyph (4)</option>' +
            '<option>Optimized Anaglyph 1 (5)</option>' +
            '<option>Optimized Anaglyph 2 (6)</option>' +
            '<option>Gray Anaglyph (7)</option>' +
            '<option>Half Color Anaglyph (8)</option>' +
            '<option>True Anaglyph (9)</option>' +
            '<option>Interlaced</option>' +
            '<option>Interlaced vertical</option>' +
            '</select><br />' +
            '<select onchange="stereoGlassesChange();" id="stereoGlasses" />' +
            '<option>Red-Cyan glasses</option>' +
            '<option>Green-Magenta glasses</option>' +
            '</select><br /><br />' +
            '<label><input type="checkbox" value="" onclick="stereoModeChange(stereoMode);" id="stereoSwap" /> Swap</label><br /><br />' +
            '<input type="button" id="stereoSaveDef" value="Save as Default" onclick="stereoSaveDef();" />' +
            '<br /><hr /><br />' +
            '<b>Background color:</b><br /><br />' +
            '<input type="button" value="White" onclick="stereoBG(2);" />' +
            '<input type="button" value="Gray" onclick="stereoBG(1);" />' +
            '<input type="button" value="Black" onclick="stereoBG(0);" /><br />' +
            '<br /><hr /><br />' +
            '<input type="checkbox" value="" onclick="stereoBG(stereoBGcolor);" id="stereoNav" style="visibility:hidden"/><!-- Navigation buttons<br /-->' +
            '<label><input type="checkbox" value="" onclick="stereoModeChange(stereoMode);" id="stereoCap" /> Show captions</label><br />' +
        '</div>' +
        '<div id="stereoHelp" style="z-index:3; position:fixed; background-color:#fff; opacity:.9; padding:16px; margin:0px; border:1px; border-style:solid; border-color:black; visibility:hidden; top:16px; right:16px;' +
                '-moz-box-shadow: 1px 4px 10px rgba(68,68,68,0.6);' +
                '-webkit-box-shadow: 1px 4px 10px rgba(68,68,68,0.6);' +
                'box-shadow: 1px 4px 10px rgba(68,68,68,0.6);' +
                'filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius=3,MakeShadow=true,ShadowOpacity=0.30);' +
                '-ms-filter: "progid:DXImageTransform.Microsoft.Blur(PixelRadius=3,MakeShadow=true,ShadowOpacity=0.30)";">' +
            'Click <b>Right</b> / <b>Left</b> or <b>Center</b> parts of the image<br /> to view <b>Next</b> / <b>Previous</b> images or <b>Options</b>.<br /><br />' +
            '<center><b>Keyboard shortcuts:</b></center><br />' +
            '<center><table style="border:0"><tr><td><b>Esc&nbsp;&nbsp;</b></td><td> - &nbsp;&nbsp;close Stereo Viewer</tr>' +
            '<tr><td><b>Right Arrow&nbsp;&nbsp;</b></td><td> - &nbsp;&nbsp;next image</tr>' +
            '<tr><td><b>Left Arrow&nbsp;&nbsp;</b></td><td> - &nbsp;&nbsp;previous image</tr>' +
            '<tr><td><b>0..9&nbsp;&nbsp;</b></td><td> - &nbsp;&nbsp;change mode</tr>' +
            '<tr><td><b>s&nbsp;&nbsp;</b></td><td> - &nbsp;&nbsp;swap left/right</tr>' +
            '</table>' +
            '<br /><input type="button" value="OK" onclick="stereoViewerOptionsOpen(false);" /></center>' +
        '</div>' +
        '<div id="stereoAbout" style="z-index:3; position:fixed; background-color:#fff; opacity:.9; padding:16px; margin:0px; border:1px; border-style:solid; border-color:black; visibility:hidden; top:16px; right:16px;' +
                '-moz-box-shadow: 1px 4px 10px rgba(68,68,68,0.6);' +
                '-webkit-box-shadow: 1px 4px 10px rgba(68,68,68,0.6);' +
                'box-shadow: 1px 4px 10px rgba(68,68,68,0.6);' +
                'filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius=3,MakeShadow=true,ShadowOpacity=0.30);' +
                '-ms-filter: "progid:DXImageTransform.Microsoft.Blur(PixelRadius=3,MakeShadow=true,ShadowOpacity=0.30)";">' +
            '<center><b>HTML5 Stereo Viewer</b><br />' +
            'version '+stereover+'<br /><br />' +
            '(C) 2013 Yury Golubinsky, Bill Bryant<br /><br />' +
            '<a href="'+stereourl+'">'+stereourl+'</a>' +
            '<br /><br /><hr /><br />' +
            '<a rel="license" href="http://creativecommons.org/licenses/by/3.0/" title="This work is licensed under a Creative Commons Attribution 3.0 Unported License"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by/3.0/88x31.png" /></a>' +
        '</div>';

    document.body.insertBefore(div, document.body.firstChild);

    if (stereoiOS && !stereoiOS_iPad) {
        document.getElementById('stereoControls').innerHTML =
            '<center><input type="button" value="Hide Options" onclick="stereoViewerOptionsOpen(false);" />' +
            '<input type="button" value="Close Viewer" onclick="stereoViewerClose();" /></center>' +
            '<hr />' +
            '<b>Mode:</b><br />' +
            '<select onchange="stereoModeChange(0);" id="modeselect">' +
            '<option>Right Left</option>' +
            '<option>Left Right</option>' +
            '<option>Left</option>' +
            '<option>Right</option>' +
            '<option>Color Anaglyph</option>' +
            '<option>Optimized Anaglyph 1</option>' +
            '<option>Optimized Anaglyph 2</option>' +
            '<option>Gray Anaglyph</option>' +
            '<option>Half Color Anaglyph</option>' +
            '<option>True Anaglyph</option>' +
            '<option>Interlaced</option>' +
            '<option>Interlaced vertical</option>' +
            '</select><br />' +
            '<select onchange="stereoGlassesChange();" id="stereoGlasses" />' +
            '<option>Red-Cyan glasses</option>' +
            '<option>Green-Magenta glasses</option>' +
            '</select><br />' +
            '<input type="checkbox" value="" onclick="stereoBG(stereoBGcolor);" id="stereoNav" style="visibility:hidden"/>' +
            '<label><input type="checkbox" value="" onclick="stereoModeChange(stereoMode);" id="stereoSwap" /> Swap</label><br />' +
            '<input type="button" id="stereoSaveDef" value="Save as Default" onclick="stereoSaveDef();" />' +
            '<hr />' +
            '<b>Background color:</b><br />' +
            '<input type="button" value="White" onclick="stereoBG(2);" />' +
            '<input type="button" value="Gray" onclick="stereoBG(1);" />' +
            '<input type="button" value="Black" onclick="stereoBG(0);" /><br />' +
            '<br />' +
            '<label><input type="checkbox" value="" onclick="stereoModeChange(stereoMode);" id="stereoCap" /> Show captions</label><br />' +
            '<hr />' +
                '<center><b>HTML5 Stereo Viewer '+stereover+'</b><br />' +
                '(C) 2013 Yury Golubinsky, Bill Bryant<br />' +
                '<a href="'+stereourl+'">'+stereourlvis+'</a>' +
                '<br /><br />' +
                '<a rel="license" href="http://creativecommons.org/licenses/by/3.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by/3.0/88x31.png" /></a>';
    }

    document.body.onkeyup = function (event) { stereoKeyPress(event); };
    document.body.onmousewheel = function (event) { stereoViewerClose(event); };
    document.body.onscroll = function (event) { stereoViewerClose(event); };
    document.body.onorientationchange = function () { stereoDrawImage(); };

    document.getElementById('stereoControls').style.zIndex = 999991;

    document.getElementById('stereoHelp').style.zIndex = 999992;

    document.getElementById('stereoAbout').style.zIndex = 999992;

    document.getElementById('stereoCanvas').width = document.documentElement.clientWidth;
    document.getElementById('stereoCanvas').height = document.documentElement.clientHeight;

    document.getElementById('stereoViewer').style.bottom = 0;
    document.getElementById('stereoViewer').style.right = 0;
    //document.getElementById('stereoViewer').style.visibility = 'visible';

    document.getElementById('stereoNav').checked = stereoNav !== 0;

    stereoCheckCookie();
    var sm = stereoGetCookie();
    if (sm >= 0 && sm <= stereoModes) {
        stereoMode = sm;
        stereoSwap = stereoGetCookieSwap() > 0;
        stereoGlasses = stereoGetCookieGlasses();
    }

    for (i = 0; i <= stereoModes; i++) {
        document.getElementById('modeselect').options[i].selected = stereoMode === i;
    }

    for (i = 0; i < document.getElementById('stereoGlasses').options.length; i++) {
        document.getElementById('stereoGlasses').options[i].selected = stereoGlasses === i;
    }

    stereoCorrectAfterMode();

    document.getElementById('stereoSwap').checked = stereoSwap;
    document.getElementById('stereoCap').checked = stereoCaption;

    if (stereoiOS) {
        var meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width = device-width; initial-scale = 1.0; user-scalable = no; maximum-scale=1.0; minimum-scale=1.0; target-densityDpi=device-dpi;';
        var b = false;
        for (i = 0; i < document.getElementsByTagName('head')[0].childNodes.length; i++) {
            if (document.getElementsByTagName('head')[0].childNodes[i].name === 'viewport') {
                document.getElementsByTagName('head')[0].replaceChild(meta, document.getElementsByTagName('head')[0].childNodes[i]);
                b = true;
                break;
            }
        }
        if (!b) {
            document.getElementsByTagName('head')[0].appendChild(meta);
        }
    }

    stereoCountImages();
    stereoDrawImage();

    stereoGetCookieForFirstTimeHelpDisplayed();
    if (stereoFirstTimeHelpDisplayed && !stereoiOS_iPhone) {
        stereoHelpOpen();
        stereoSetCookieForFirstTimeHelpDisplayed();
    }
}

function stereoViewerClose() {
    stereoViewerOptionsOpen(false);
    document.body.removeChild(document.getElementById('stereoViewer'));

    if (stereoiOS) {
        var meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width = device-width; initial-scale = 1.0; user-scalable = yes;';
        for (var i = 0; i < document.getElementsByTagName('head')[0].childNodes.length; i++) {
            if (document.getElementsByTagName('head')[0].childNodes[i].name === 'viewport') {
                document.getElementsByTagName('head')[0].replaceChild(meta, document.getElementsByTagName('head')[0].childNodes[i]);
                break;
            }
        }
    }
}

function setPixel(imageData, x, y, r, g, b, a) {
    var index = (x + y * imageData.width) * 4;
    imageData.data[index++] = r;
    imageData.data[index++] = g;
    imageData.data[index++] = b;
    imageData.data[index++] = a;
}

function stereoMouseClick(event) {
    var mx = 0,
        my = 0,
        b = false,
        cnvs = document.getElementById('stereoCanvas');

    if (!event) {
        event = window.event;
    }
    if (event.pageX || event.pageY) {
        mx = event.pageX;
        my = event.pageY;
    }
    else if (event.clientX || event.clientY) {
        mx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        my = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    //if (stereoiOS) {
        if (mx < cnvs.width / 3) { // left
            stereoPrevImage();
            b = true;
        }
        else if (mx >= 2 * cnvs.width / 3) { // right
            stereoNextImage();
            b = true;
        }
    //}

    /*
    // buttons
    else if (stereoNav > 0) {
        if (mx >= 0 && mx < stereoNav && my >= 0 && my < cnvs.height) { // left
            stereoPrevImage();
            b = true;
        }
        else if (mx >= cnvs.width - stereoNav && mx < cnvs.width && my >= 0 && my < cnvs.height) { // right
            stereoNextImage();
            b = true;
        }
    }
    */

    if (!b) { // center
        stereoViewerOptionsOpen(!stereoOptVis);
    }
}

function stereoViewerOptionsOpen(value) {
    var s = value ? 'visible' : 'hidden';

    document.getElementById('stereoControls').style.visibility = s;

    if (!value) {
        document.getElementById('stereoHelp').style.visibility = s;
        document.getElementById('stereoAbout').style.visibility = s;
    }

    stereoOptVis = value;
}

function stereoHelpOpen() {
    var s;
    if (document.getElementById('stereoHelp').style.visibility === 'hidden') {
        s = 'visible';
    }
    else {
        s = 'hidden';
    }
    document.getElementById('stereoHelp').style.visibility = s;
    document.getElementById('stereoAbout').style.visibility = 'hidden';
}

function stereoAboutOpen() {
    var s;
    if (document.getElementById('stereoAbout').style.visibility === 'hidden') {
        s = 'visible';
    }
    else {
        s = 'hidden';
    }
    document.getElementById('stereoAbout').style.visibility = s;
    document.getElementById('stereoHelp').style.visibility = 'hidden';
}

function stereoDrawControls(event) {
    var mx = 0,
        my = 0,
        cnvs,
        ctx,
        color1,
        color2,
        color11,
        color22;

    if (!event) {
        event = window.event;
    }
    if (event.pageX || event.pageY) {
        mx = event.pageX;
        my = event.pageY;
    }
    else if (event.clientX || event.clientY) {
        mx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        my = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    function _draw(color1, color2, color11, color22) {
        ctx.fillStyle = color1;
        ctx.fillRect(0, 0, stereoNav, cnvs.height);

        ctx.fillStyle = color11;
        ctx.beginPath();
        ctx.moveTo(stereoNav / 3, cnvs.height / 2);
        ctx.lineTo(2 * stereoNav / 3, cnvs.height / 2 + stereoNav / 3);
        ctx.lineTo(2 * stereoNav / 3, cnvs.height / 2 - stereoNav / 3);
        ctx.lineTo(stereoNav / 3, cnvs.height / 2);
        ctx.fill();

        ctx.fillStyle = color2;
        ctx.fillRect(cnvs.width - stereoNav, 0, cnvs.width, cnvs.height);

        ctx.fillStyle = color22;
        ctx.beginPath();
        ctx.moveTo(cnvs.width - stereoNav / 3, cnvs.height / 2);
        ctx.lineTo(cnvs.width - 2 * stereoNav / 3, cnvs.height / 2 + stereoNav / 3);
        ctx.lineTo(cnvs.width - 2 * stereoNav / 3, cnvs.height / 2 - stereoNav / 3);
        ctx.lineTo(cnvs.width - stereoNav / 3, cnvs.height / 2);
        ctx.fill();
    }

    if (stereoNav > 0) {
        cnvs = document.getElementById('stereoCanvas');
        ctx = cnvs.getContext('2d');

        switch (stereoBGcolor) {
            case 0:
                color1 = 'rgba(60, 60, 60, 1.0)';
                color2 = 'rgba(30, 30, 30, 1.0)';
                color11 = 'rgba(30, 30, 30, 1.0)';
                color22 = 'rgba(0, 0, 0, 1.0)';
                break;
            case 1:
                color1 = 'rgba(190, 190, 190, 1.0)';
                color2 = 'rgba(160, 160, 160, 1.0)';
                color11 = 'rgba(160, 160, 160, 1.0)';
                color22 = 'rgba(130, 130, 130, 1.0)';
                break;
            case 2:
                color1 = 'rgba(240, 240, 240, 1.0)';
                color2 = 'rgba(220, 220, 220, 1.0)';
                color11 = 'rgba(255, 255, 255, 1.0)';
                color22 = 'rgba(240, 240, 240, 1.0)';
        }

        if (mx >= 0 && mx < stereoNav && my >= 0 && my < cnvs.height) { // left
            if (stereoMouse !== 0) {
                _draw(color1, color2, color11, color22);
                stereoMouse = 0;
            }
        }
        else if (mx >= cnvs.width - stereoNav && mx < cnvs.width && my >= 0 && my < cnvs.height) { // right
            if (stereoMouse !== 2) {
                _draw(color2, color1, color22, color11);
                stereoMouse = 2;
            }
        }
        else if (stereoMouse !== 1) {
            _draw(color2, color2, color22, color22);
            stereoMouse = 1;
        }
    }
}

function stereoDrawImage() {
    var mc = stereoCaption ? 30 : 0, // caption height
        imw = 0,
        imh = 0,
        stereoMode_ = stereoMode,
        stereoSwap_ = stereoSwap,
        imageData, x, y;

    function prepareWH2() {
        if ((cnvswidth - stereoNav * 2) / (cnvsheight - mc) >= img.width / img.height / 2) {
            imh = cnvsheight - mc;
            imw = imh * (img.width / img.height) / 2;
        }
        else {
            imw = cnvswidth - stereoNav * 2;
            imh = imw * (img.height / img.width) * 2;
        }
        imw = Math.round(imw);
        imh = Math.round(imh);
    }

    function prepareWH2i() {
        if ((cnvswidth - stereoNav * 2) / (cnvsheight - mc) >= img.width / img.height / 2) {
            imh = (cnvsheight - mc) / 2;
            imw = (cnvsheight - mc) * (img.width / img.height) / 2;
        }
        else {
            imw = cnvswidth - stereoNav * 2;
            imh = imw * (img.height / img.width);
        }
        imw = Math.round(imw);
        imh = Math.round(imh);
    }

    function prepareWH2iv() {
        if ((cnvswidth - stereoNav * 2) / (cnvsheight - mc) >= img.width / img.height / 2) {
            imh = cnvsheight - mc;
            imw = imh * (img.width / img.height) / 2;
        }
        else {
            imw = cnvswidth - stereoNav * 2;
            imh = imw * (img.height / img.width) * 2;
        }
        imw = Math.round(imw / 2);
        imh = Math.round(imh);
    }

    function prepareWH() {
        if ((cnvswidth - stereoNav * 2) / (cnvsheight - mc) >= img.width / img.height) {
            imh = cnvsheight - mc;
            imw = imh * (img.width / img.height);
        }
        else {
            imw = cnvswidth - stereoNav * 2;
            imh = imw * (img.height / img.width);
        }
        imw = Math.round(imw);
        imh = Math.round(imh);
    }

    var cnvs = document.getElementById('stereoCanvas'),
        ctx = cnvs.getContext('2d'),
        cnvsheight = document.getElementById('stereoViewer').clientHeight,
        cnvswidth = document.getElementById('stereoViewer').clientWidth,
        elmnt = document.getElementById('stereoCanvasdiv');

    //if (elmnt.height !== cnvsheight) {
        elmnt.height = cnvsheight;
    //}
    //if (elmnt.width !== cnvswidth) {
        elmnt.width = cnvswidth;
    //}

    elmnt = document.getElementById('stereoCanvas');

    //if (elmnt.height !== cnvsheight) {
        elmnt.height = cnvsheight;
    //}
    //if (width !== cnvswidth) {
        elmnt.width = cnvswidth;
    //}

    ///////////////////////////////////
    var img = new Image();
    img.src = images[imageN];

    switch (stereoBGcolor) {
        case 0:
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            break;
        case 1:
            ctx.fillStyle = 'rgba(128, 128, 128, 1)';
            break;
        case 2:
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    }
    ctx.fillRect(stereoNav, 0, cnvswidth - stereoNav * 2, cnvsheight);
    document.getElementById('stereoViewer').style.backgroundColor = ctx.fillStyle;

    function prepareAnaglyphData(inter) {
        buf = document.createElement('canvas');
        buf.width = imw * 2;
        buf.height = imh;
        bufctx = buf.getContext('2d');
        bufctx.drawImage(img, 0, 0, imw * 2, imh);

        if (!inter) {
            imageData = ctx.createImageData(imw, imh);
        }
        else if (stereoMode_ === 10) {
            imageData = ctx.createImageData(imw, imh * 2);
        }
        else {
            imageData = ctx.createImageData(imw * 2, imh);
        }

        if (imagesT[imageN] === 'stereoLR') {
            stereoSwap_ = !stereoSwap_;
        }

        var ssw = stereoSwap_;
        if (inter) {
            switch (stereoMode_) {
                case 10:
                    if (((cnvsheight - mc - imh * 2) / 2) % 2 === 0) {
                        ssw = !ssw;
                    }
                    break;
                case 11:
                    if (((cnvswidth - imw * 2) / 2) % 2 === 0) {
                        ssw = !ssw;
                    }
                    break;
            }
        }

        if (!ssw) {
            iData1 = bufctx.getImageData(0, 0, imw, imh);
            iData2 = bufctx.getImageData(imw, 0, imw, imh);
        }
        else {
            iData2 = bufctx.getImageData(0, 0, imw, imh);
            iData1 = bufctx.getImageData(imw, 0, imw, imh);
        }
    }

    function _getLines(phrase, maxPxLength) {
        var phraseArray = [];
        if (phrase) {
            var wa = phrase.split(' '),
                lastPhrase = '',
                l = maxPxLength,
                measure = 0,
                i, w;

            for (i = 0; i < wa.length; i++) {
                w = wa[i];
                measure = ctx.measureText(lastPhrase + w).width;
                if (measure < l) {
                    lastPhrase += (' '+w);
                }
                else {
                    phraseArray.push(lastPhrase);
                    lastPhrase = w;
                }

                if (i === wa.length - 1) {
                    phraseArray.push(lastPhrase);
                    break;
                }
            }
        }
        return phraseArray;
    }

    function _drawText(num) {
        var i, s, h;
        if (stereoCaption) {
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            switch (stereoBGcolor) {
                case 0:
                    ctx.fillStyle = 'rgba(128, 128, 128, 1)';
                    break;
                case 1:
                    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    break;
                case 2:
                    ctx.fillStyle = 'rgba(128, 128, 128, 1)';
            }
            h = ctx.measureText('Wg').width;
            if (num === 1) {
                s = _getLines(imagesC[imageN], cnvswidth - 36);
                for (i = 0; i < s.length; i++) {
                    ctx.fillText(s[i], cnvswidth / 2, cnvsheight / 2 + imh / 2 + i * h);
                }
            } else {
                s = _getLines(imagesC[imageN], imw / 2 - 36);
                for (i = 0; i < s.length; i++) {
                    //var e = ctx.measureText(s[i]).height;
                    ctx.fillText(s[i], (cnvswidth - imw) / 2 + imw / 4, cnvsheight / 2 + imh / 2 + i * h);
                    ctx.fillText(s[i], cnvswidth / 2 + imw / 4, cnvsheight / 2 + imh / 2 + i * h);
                }
            }
        }
    }

    if (images.length > 0) {
        var buf, bufctx, iData1, iData2, idr, idg, idb,
            r, g, b,
            index = 0,
            index1 = 0,
            index2 = 0,
            index1_ = 0,
            index2_ = 0,
            indexy = 0;

        switch (imagesT[imageN]) {
            case 'flat':
            case 'anaglyph':
                stereoMode_ = 0;
                stereoSwap_ = false;
                break;
            case 'stereoRL':
            case 'stereoLR':
                stereoMode_ = stereoMode;
                stereoSwap_ = stereoSwap;
                break;
        }

        if (stereoIE) {
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            switch (stereoBGcolor) {
                case 0:
                    ctx.fillStyle = 'rgba(255, 128, 128, 1)';
                    break;
                case 1:
                    ctx.fillStyle = 'rgba(255, 192, 192, 1)';
                    break;
                case 2:
                    ctx.fillStyle = 'rgba(255, 128, 128, 1)';
            }
            ctx.fillText('Internet Explorer is not supported in this version', cnvswidth / 2, cnvsheight / 2);
            switch (stereoBGcolor) {
                case 0:
                    ctx.fillStyle = 'rgba(128, 128, 128, 1)';
                    break;
                case 1:
                    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    break;
                case 2:
                    ctx.fillStyle = 'rgba(128, 128, 128, 1)';
            }
            var h = ctx.measureText('Wg').width;
            ctx.fillText('Press Esc to close the slideshow', cnvswidth / 2, cnvsheight / 2 + h * 2);
            ctx.fillText('Please use Safari, Chrome, Firefox or Opera', cnvswidth / 2, cnvsheight / 2 + h * 3);
        }
        else if (!img.complete) {
            img.onload = stereoDrawImage;
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            switch (stereoBGcolor) {
                case 0:
                    ctx.fillStyle = 'rgba(128, 128, 128, 1)';
                    break;
                case 1:
                    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    break;
                case 2:
                    ctx.fillStyle = 'rgba(128, 128, 128, 1)';
            }
            ctx.fillText('Loading...', cnvswidth / 2, cnvsheight / 2);
        }
        else {

            if (stereoMode_ === 1) {
                stereoSwap_ = !stereoSwap_;
            }

            switch (stereoMode_) {

                //case 1: // RL
                //    stereoSwap_ = !stereoSwap_;
                case 0: // LR
                    prepareWH();
                    if (imagesT[imageN] === 'stereoLR') {
                        stereoSwap_ = !stereoSwap_;
                    }
                    if (!stereoSwap_) {
                        ctx.drawImage(img, (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2, imw, imh);
                    }
                    else {
                        ctx.drawImage(img, 0, 0, img.width / 2, img.height,
                            (cnvswidth - imw) / 2 + imw / 2, (cnvsheight - mc - imh) / 2, imw / 2, imh);
                        ctx.drawImage(img, img.width / 2, 0, img.width / 2, img.height,
                            (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2, imw / 2, imh);
                    }
                    if (imagesT[imageN] === 'flat' || imagesT[imageN] === 'anaglyph') {
                        _drawText(1);
                    }
                    else {
                        _drawText(2);
                    }
                    break;

                case 3: // only Left
                    prepareWH2();
                    if (imagesT[imageN] === 'stereoLR') {
                        stereoSwap_ = !stereoSwap_;
                    }
                    if (!stereoSwap_) {
                        ctx.drawImage(img, 0, 0, img.width / 2, img.height,
                            (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2, imw, imw * (img.height / img.width * 2));
                    }
                    else {
                        ctx.drawImage(img, img.width / 2, 0, img.width / 2, img.height,
                            (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2, imw, imw * (img.height / img.width * 2));
                    }
                    _drawText(1);
                    break;

                case 2: // only Right
                    prepareWH2();
                    if (imagesT[imageN] === 'stereoLR') {
                        stereoSwap_ = !stereoSwap_;
                    }
                    if (!stereoSwap_) {
                        ctx.drawImage(img, img.width / 2, 0, img.width / 2, img.height,
                            (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2, imw, imw * (img.height / img.width * 2));
                    }
                    else {
                        ctx.drawImage(img, 0, 0, img.width / 2, img.height,
                            (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2, imw, imw * (img.height / img.width * 2));
                    }
                    _drawText(1);
                    break;

                case 4: // color anaglyph
                    prepareWH2();
                    prepareAnaglyphData(false);

                    idr = iData2;
                    idg = iData1;
                    idb = iData1;
                    if (stereoGlasses === sGlassesGreenMagenta) {
                        idr = iData1;
                        idg = iData2;
                        idb = iData1;
                    }
                    y = imw * imh;
                    for (x = 0; x++ < y; ) {
                        // Data2 - left; Data1 - right
                        imageData.data[index] = idr.data[index++];
                        imageData.data[index] = idg.data[index++];
                        imageData.data[index] = idb.data[index++];
                        imageData.data[index] = 0xFF; index++;
                    }

                    ctx.putImageData(imageData, (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2);
                    _drawText(1);
                    break;

                case 5: // optimized color anaglyph
                    prepareWH2();
                    prepareAnaglyphData(false);

                    idr = iData2;
                    idg = iData1;
                    idb = iData1;
                    if (stereoGlasses === sGlassesGreenMagenta) {
                        idr = iData1;
                        idg = iData2;
                        idb = iData1;
                    }
                    y = imw * imh;
                    for (x = 0; x++ < y; ) {
                        // Data2 - left; Data1 - right
                        r = idr.data[index+1] * 0.7 + idr.data[index+2] * 0.3;
                        g = idg.data[index+1];
                        b = idb.data[index+2];
                        r = Math.min(Math.max(r, 0), 255);
                        imageData.data[index++] = r;
                        imageData.data[index++] = g;
                        imageData.data[index++] = b;
                        imageData.data[index++] = 0xFF;
                    }

                    ctx.putImageData(imageData, (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2);
                    _drawText(1);
                    break;

                case 6: // optimized+ color anaglyph
                    prepareWH2();
                    prepareAnaglyphData(false);

                    idr = iData2;
                    idg = iData1;
                    idb = iData1;
                    if (stereoGlasses === sGlassesGreenMagenta) {
                        idr = iData1;
                        idg = iData2;
                        idb = iData1;
                    }
                    y = imw * imh;
                    for (x = 0; x++ < y; ) {
                        // Data2 - left; Data1 - right
                        g = idr.data[index+1] + 0.45 * Math.max(0, idr.data[index+0] - idr.data[index+1]);
                        b = idr.data[index+2] + 0.25 * Math.max(0, idr.data[index+0] - idr.data[index+2]);
                        r = g * 0.749 + b * 0.251;
                        //r = Math.pow(g * 0.749 + b * 0.251, 1/1.6);
                        g = idg.data[index+1] + 0.45 * Math.max(0, idg.data[index+0] - idg.data[index+1]);
                        b = idb.data[index+2] + 0.25 * Math.max(0, idb.data[index+0] - idb.data[index+2]);
                        r = Math.min(Math.max(r, 0), 255);
                        g = Math.min(Math.max(g, 0), 255);
                        b = Math.min(Math.max(b, 0), 255);
                        imageData.data[index++] = r;
                        imageData.data[index++] = g;
                        imageData.data[index++] = b;
                        imageData.data[index++] = 0xFF;
                    }

                    ctx.putImageData(imageData, (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2);
                    _drawText(1);
                    break;

                case 7: // gray anaglyph
                    prepareWH2();
                    prepareAnaglyphData(false);

                    idr = iData2;
                    idg = iData1;
                    idb = iData1;
                    if (stereoGlasses === sGlassesGreenMagenta) {
                        idr = iData1;
                        idg = iData2;
                        idb = iData1;
                    }
                    y = imw * imh;
                    for (x = 0; x++ < y; ) {
                        // Data2 - left; Data1 - right
                        r = idr.data[index+0] * 0.299 + idr.data[index+1] * 0.587 + idr.data[index+2] * 0.114;
                        g = idg.data[index+0] * 0.299 + idg.data[index+1] * 0.587 + idg.data[index+2] * 0.114;
                        b = idb.data[index+0] * 0.299 + idb.data[index+1] * 0.587 + idb.data[index+2] * 0.114;
                        r = Math.min(Math.max(r, 0), 255);
                        g = Math.min(Math.max(g, 0), 255);
                        b = Math.min(Math.max(b, 0), 255);
                        imageData.data[index++] = r;
                        imageData.data[index++] = g;
                        imageData.data[index++] = b;
                        imageData.data[index++] = 0xFF;
                    }

                    ctx.putImageData(imageData, (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2);
                    _drawText(1);
                    break;

                case 8: // half color anaglyph
                    prepareWH2();
                    prepareAnaglyphData();

                    idr = iData2;
                    idg = iData1;
                    idb = iData1;
                    if (stereoGlasses === sGlassesGreenMagenta) {
                        idr = iData1;
                        idg = iData2;
                        idb = iData1;
                    }
                    y = imw * imh;
                    for (x = 0; x++ < y; ) {
                        // Data2 - left; Data1 - right
                        r = idr.data[index+0] * 0.299 + idr.data[index+1] * 0.587 + idr.data[index+2] * 0.114;
                        g = idg.data[index+1];
                        b = idb.data[index+2];
                        r = Math.min(Math.max(r, 0), 255);
                        imageData.data[index++] = r;
                        imageData.data[index++] = g;
                        imageData.data[index++] = b;
                        imageData.data[index++] = 0xFF;
                    }

                    ctx.putImageData(imageData, (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2);
                    _drawText(1);
                    break;

                case 9: // true anaglyph
                    prepareWH2();
                    prepareAnaglyphData(false);

                    idr = iData2;
                    idg = iData1;
                    idb = iData1;
                    if (stereoGlasses === sGlassesGreenMagenta) {
                        idr = iData1;
                        idg = iData2;
                        idb = iData2;
                    }
                    y = imw * imh;
                    for (x = 0; x++ < y; ) {
                        // Data2 - left; Data1 - right
                        r = idr.data[index+0] * 0.299 + idr.data[index+1] * 0.587 + idr.data[index+2] * 0.114;
                        if (stereoGlasses === sGlassesGreenMagenta) {
                            g = idg.data[index+0] * 0.299 + idg.data[index+1] * 0.587 + idg.data[index+2] * 0.114;
                            b = 0;
                        } else {
                            g = 0;
                            b = idb.data[index+0] * 0.299 + idb.data[index+1] * 0.587 + idb.data[index+2] * 0.114;
                        }
                        r = Math.min(Math.max(r, 0), 255);
                        b = Math.min(Math.max(b, 0), 255);
                        imageData.data[index++] = r;
                        imageData.data[index++] = g;
                        imageData.data[index++] = b;
                        imageData.data[index++] = 0xFF;
                    }

                    ctx.putImageData(imageData, (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2);
                    _drawText(1);
                    break;

                case 10: // interlaced
                    prepareWH2i();
                    prepareAnaglyphData(true);

                    indexy = imw * 4;
                    index2_ = indexy;
                    for (y = 0; y++ < imh; ) {
                        for (x = 0; x++ < imw; ) {
                            // Data2 - left; Data1 - right
                            imageData.data[index1_++] = iData1.data[index1++];
                            imageData.data[index1_++] = iData1.data[index1++];
                            imageData.data[index1_++] = iData1.data[index1++];
                            imageData.data[index1_++] = 0xFF; index1++;
                            imageData.data[index2_++] = iData2.data[index2++];
                            imageData.data[index2_++] = iData2.data[index2++];
                            imageData.data[index2_++] = iData2.data[index2++];
                            imageData.data[index2_++] = 0xFF; index2++;
                        }
                        index1_ = index1_ + indexy;
                        index2_ = index2_ + indexy;
                    }

                    imh = imh * 2;
                    ctx.putImageData(imageData, (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2);
                    _drawText(1);
                    break;

                case 11: // interlaced vertical
                    prepareWH2iv();
                    prepareAnaglyphData(true);

                    y = imw * imh;
                    for (x = 0; x++ < y; ) {
                        // Data2 - left; Data1 - right
                        imageData.data[index1_++] = iData1.data[index1++];
                        imageData.data[index1_++] = iData1.data[index1++];
                        imageData.data[index1_++] = iData1.data[index1++];
                        imageData.data[index1_++] = 0xFF; index1++;
                        imageData.data[index1_++] = iData2.data[index2++];
                        imageData.data[index1_++] = iData2.data[index2++];
                        imageData.data[index1_++] = iData2.data[index2++];
                        imageData.data[index1_++] = 0xFF; index2++;
                    }

                    imw = imw * 2;
                    ctx.putImageData(imageData, (cnvswidth - imw) / 2, (cnvsheight - mc - imh) / 2);
                    _drawText(1);
                    break;

            } //switch
        }
    } else {
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        switch (stereoBGcolor) {
            case 0:
                ctx.fillStyle = 'rgba(128, 128, 128, 1)';
                break;
            case 1:
                ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                break;
            case 2:
                ctx.fillStyle = 'rgba(128, 128, 128, 1)';
        }
        ctx.fillText('No stereo images', cnvswidth / 2, cnvsheight / 2);
    }
    ///////////////////////////////////
    stereoDrawControls();
}

function stereoCountImages() {
    function getClassName(obj, c) {
        if (obj.className) {
            var arrList = obj.className.split(' ');
            for (var i = 0; i < arrList.length; i++) {
                for (var j = 0; j < c.length; j++) {
                    if (arrList[i] === c[j]) {
                        return c[j];
                    }
                }
            }
        }
        return '';
    }

    var j, n = 0;
    for (j = 0; j < document.images.length; j++) {
        var cn = getClassName(document.images[j], ['anaglyph', 'flat', 'stereo', 'stereoLR', 'stereoRL']);
        if (cn !== '') {
            images[n] = document.images[j].src;
            imagesC[n] = document.images[j].getAttribute(stereoCaptionSrc);
            imagesT[n] = cn;
            if (imagesT[n] === 'stereo') {
                imagesT[n] = stereoDefType;
            }
            if (n === 0) {
                var img = new Image();
                img.src = images[n];
                img.onload = stereoDrawImage;
            }
            n++;
        }
    }
    imageN = 0;
}

function stereoPrevImage() {
    if (imageN > 0) {
        imageN--;
    }
    else {
        imageN = images.length - 1;
    }
    if (imageN < 0) {
        imageN = 0;
    }
    stereoDrawImage();
}

function stereoNextImage() {
    if (imageN < images.length - 1) {
        imageN++;
    }
    else {
        imageN = 0;
    }
    stereoDrawImage();
}

function stereoModeChange() {
    var elmnt = document.getElementById('modeselect');
    for (var i = 0; i <= stereoModes; i++) {
        if (elmnt.options[i].selected) {
            stereoMode = i;
            break;
        }
    }
    stereoSwap = document.getElementById('stereoSwap').checked;
    stereoCaption = document.getElementById('stereoCap').checked;

    stereoCorrectAfterMode();

    stereoDrawImage();
}

function stereoGlassesChange() {
    var elmnt = document.getElementById('stereoGlasses');
    for (var i = 0; i < elmnt.options.length; i++) {
        if (elmnt.options[i].selected) {
            stereoGlasses = i;
            break;
        }
    }
    stereoDrawImage();
}

function stereoKeyPress(e) {
    var keynum;

    if (window.event) { // IE
        keynum = e.keyCode;
    }
    else if (e.which) { // Netscape/Firefox/Opera
        keynum = e.which;
    }

    //alert(keynum);

    function _mode(value) {
        stereoMode = value;
        stereoDrawImage();
        var elmnt = document.getElementById('modeselect');
        for (var i = 0; i <= stereoModes; i++) {
            elmnt.options[i].selected = stereoMode === i;
        }

        stereoCorrectAfterMode();

    }

    switch (keynum) {
        // Controls
        case 16:
        case 191:
            stereoHelpOpen();
            break;
        case 27:
            stereoViewerClose();
            break;
        case 83: //'s'
            document.getElementById('stereoSwap').checked = !stereoSwap;
            stereoModeChange(stereoMode);
            break;
        // Navigation
        case 37:
        case 38:
            stereoPrevImage();
            break;
        case 32:
        case 39:
        case 40:
            stereoNextImage();
            break;
        // stereo Mode
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
            _mode(keynum - 48);
            break;
    }
}

function stereoSaveAs() {
    var canvas = document.getElementById('canvas'),
        f = canvas.mozGetAsFile('stereo.png'),
        newImg = document.createElement('img');
    newImg.src = f.toDataURL();
    document.body.appendChild(newImg);
}

function stereoBG(c) {
    stereoBGcolor = c;
    if (document.getElementById('stereoNav').checked && !stereoiOS) {
        stereoNav = stereoNavDef;
    }
    else {
        stereoNav = 0;
    }
    stereoMouse = -1;

    stereoDrawImage();
    stereoDrawControls();
}

function stereoSaveDef() {
    if (stereoGetCookie() < 0) {
        stereoSetCookie(stereoMode, stereoSwap ? 1 : 0, stereoGlasses);
    }
    else {
        stereoSetCookie(-1, stereoSwap ? 1 : 0, 0);
    }
    stereoCheckCookie();
}

function stereoCheckCookie() {
    var sm = stereoGetCookie();
    if (sm >= 0 && sm <= stereoModes) {
        document.getElementById('stereoSaveDef').value = 'Forget Defaults';
    }
    else {
        document.getElementById('stereoSaveDef').value = 'Save as Default';
    }
    document.getElementById('stereoSwap').checked = stereoGetCookieSwap() > 0;
    //document.getElementById('stereoGlasses').checked = stereoGetCookieGlasses();
}

function stereoSetCookie(m, s, gm) {
    document.cookie = 'HTML5_STEREO_VIEWER=' + escape(m.toString()) + '; path=/';
    document.cookie = 'HTML5_STEREO_VIEWER_SWAP=' + escape(s.toString()) + '; path=/';
    document.cookie = 'HTML5_STEREO_VIEWER_GLASSES=' + escape(gm.toString()) + '; path=/';
}

function stereoSetCookieForFirstTimeHelpDisplayed() {
    document.cookie = 'HTML5_STEREO_VIEWER_FIRST_TIME_HELP_DISPLAYED=YES' + '; path=/';
}

function stereoGetCookieForFirstTimeHelpDisplayed() {
    stereoFirstTimeHelpDisplayed = true;
    var a = document.cookie.split(';');
    for (var i = 0; i < a.length; i++) {
        if (a[i].substr(0,a[i].indexOf('=')).trim() === 'HTML5_STEREO_VIEWER_FIRST_TIME_HELP_DISPLAYED') {
            stereoFirstTimeHelpDisplayed = unescape(a[i].substr(a[i].indexOf('=')+1) !== 'YES');
            return stereoFirstTimeHelpDisplayed;
        }
    }
    return stereoFirstTimeHelpDisplayed;
}

function stereoGetCookie() {
    var a = document.cookie.split(';');
    for (var i = 0; i < a.length; i++) {
        if (a[i].substr(0,a[i].indexOf('=')).trim() === 'HTML5_STEREO_VIEWER') {
            return parseInt(unescape(a[i].substr(a[i].indexOf('=')+1)), 10);
        }
    }
    return -1;
}

function stereoGetCookieSwap() {
    var a = document.cookie.split(';');
    for (var i = 0; i < a.length; i++) {
        if (a[i].substr(0,a[i].indexOf('=')).trim() === 'HTML5_STEREO_VIEWER_SWAP') {
            return parseInt(unescape(a[i].substr(a[i].indexOf('=')+1)), 10);
        }
    }
    return false;
}

function stereoGetCookieGlasses() {
    var a = document.cookie.split(';');
    for (var i = 0; i < a.length; i++) {
        if (a[i].substr(0,a[i].indexOf('=')).trim() === 'HTML5_STEREO_VIEWER_GLASSES') {
            return parseInt(unescape(a[i].substr(a[i].indexOf('=')+1)), 10);
        }
    }
    return false;
}

function stereoCorrectAfterMode() {
    if (stereoMode <= stereoModes - 2 && stereoMode >= 4) {
        document.getElementById('stereoGlasses').style.visibility = 'inherit';
    } else {
        document.getElementById('stereoGlasses').style.visibility = 'hidden';
    }
}
