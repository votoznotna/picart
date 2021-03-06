/* jQuery Image Magnify script v1.1
 * This notice must stay intact for usage
 * Author: Dynamic Drive at http://www.dynamicdrive.com/
 * Visit http://www.dynamicdrive.com/ for full source code

 * Nov 16th, 09 (v1.1): Adds ability to dynamically apply/reapply magnify effect to an image, plus magnify to a specific width in pixels.
 * Feb 8th, 11 (v1.11): Fixed bug that caused script to not work in newever versions of jQuery (ie: v1.4.4)
 */

'use strict';


jQuery.noConflict();

jQuery.imageMagnify={
	dsettings: {
		windowFit: true,
		vIndent: 0,
		hIndent: 0,
		heightPad: 0,
		widthPad: 0,
		magnifyby: 3, //default increase factor of enlarged image
		duration: 500, //default duration of animation, in millisec
		imgopacity: 0.2 //opacify of original image when enlarged image overlays it
	},
	cursorcss: 'url(/modules/common/js/magnify/cursor_zoom.cur), -moz-zoom-in', //Value for CSS's 'cursor' attribute, added to original image
	zIndexcounter: 100,

		refreshoffsets:function($window, $target, warpshell){
		var $offsets=$target.offset();
		var winattrs={x:$window.scrollLeft(), y:$window.scrollTop(), w:$window.width(), h:$window.height()};
		warpshell.attrs.x=$offsets.left; //update x position of original image relative to page
		warpshell.attrs.y=$offsets.top;
		warpshell.newattrs.x=winattrs.x+winattrs.w/2-warpshell.newattrs.w/2;
		warpshell.newattrs.y=winattrs.y+winattrs.h/2-warpshell.newattrs.h/2;
		if (warpshell.newattrs.x<winattrs.x+5){ //no space to the left?
			warpshell.newattrs.x=winattrs.x+5;
		}
		else if (warpshell.newattrs.x+warpshell.newattrs.w > winattrs.x+winattrs.w){//no space to the right?
			warpshell.newattrs.x=winattrs.x+5;
		}
		if (warpshell.newattrs.y<winattrs.y+5){ //no space at the top?
			warpshell.newattrs.y=winattrs.y+5;
		}
	},

	refreshSize: function($window, $target, imageinfo, setting){

		var element = $target.get(0);
		var natHeight = element.naturalHeight;
		var natWidth = element.naturalWidth;

		if(natHeight >= natWidth)
		{
			imageinfo.newattrs.h = (natHeight < $window.height() - setting.vIndent) ? natHeight : $window.height() - setting.vIndent;
			imageinfo.newattrs.w =  imageinfo.newattrs.h * natWidth / natHeight;
			if(imageinfo.newattrs.w >   $window.width()){
				imageinfo.newattrs.w = (imageinfo.newattrs.w < $window.width() - setting.hIndent) ? imageinfo.newattrs.w :  $window.width() - setting.hIndent;
				imageinfo.newattrs.h =  imageinfo.newattrs.w * natHeight / natWidth;
			}
		}
		else{
			imageinfo.newattrs.w =  (natWidth < $window.width() - setting.hIndent) ? natWidth :  $window.width() - setting.hIndent;
			imageinfo.newattrs.h =  imageinfo.newattrs.w * natHeight / natWidth;

			if(imageinfo.newattrs.h >   $window.height() - setting.vIndent){
				imageinfo.newattrs.h = (imageinfo.newattrs.h < $window.height() - setting.vIndent) ? imageinfo.newattrs.h : $window.height() - setting.vIndent;
				imageinfo.newattrs.w =  imageinfo.newattrs.h * natWidth / natHeight;
			}
		}

	},

	magnify:function($, $target, options){
		var setting={}; //create blank object to store combined settings
		var setting=jQuery.extend(setting, this.dsettings, options);
		var attrs=(options.thumbdimensions)? {w:options.thumbdimensions[0], h:options.thumbdimensions[1]} : {w:$target.outerWidth(), h:$target.outerHeight()};
		var newattrs={};
        var bEnforceZoomOut=false;

		//newattrs.w= (setting.magnifyto)? setting.magnifyto : Math.round(attrs.w*setting.magnifyby)
		//newattrs.h=(setting.magnifyto)? Math.round(attrs.h*newattrs.w/attrs.w) : Math.round(attrs.h*setting.magnifyby)

		$target.css('cursor', jQuery.imageMagnify.cursorcss)
		if ($target.data('imgshell')){
			$target.data('imgshell').$clone.remove();
			$target.css({opacity:1}).unbind('click.magnify');
		}
		var $clone=$target.clone().css({position:'absolute', left:0, top:0, display:'none', border:'1px solid gray', cursor:'pointer'}).appendTo(document.body);
		$clone.data('$relatedtarget', $target); //save $target image this enlarged image is associated with
		$clone.data('$zoomOutProgress', '0');
		$clone.data('$zoomStatus', '0');
		$target.data('imgshell', {$clone:$clone, attrs:attrs, newattrs:newattrs});
		$target.bind('click.magnify', function(e){ //action when original image is clicked on
			var $this=$(this).css({opacity:setting.imgopacity});
			var imageinfo=$this.data('imgshell');
			if(!imageinfo) return;
			jQuery.imageMagnify.refreshSize($(window), $this, imageinfo, setting);
			jQuery.imageMagnify.refreshoffsets($(window), $this, imageinfo); //refresh offset positions of original and warped images
			var $clone=imageinfo.$clone;
            $clone.data('$zoomStatus', '0');
            $clone.data('$zoomInProgress', '1');


            function cloneHandler(event, aClone, aThis){

                if(	event.target !== aThis.get(0)
                    && (aClone.data('$zoomStatus') == '1' && aClone.data('$zoomOutProgress') == '0'
                    || aClone.data('$zoomInProgress') == '1'
                    )
                ) {
                    if(aClone.data('$zoomInProgress') == '1'){
                        aClone.clearQueue();
                        aClone.stop(true, true);
                        bEnforceZoomOut=true;
                    }
                    else{
                        $clone.click();
                    }

                }
            };

			$('body').on('click',  function(e){
                cloneHandler(e, $clone, $this);
			});

			$(window).on('scroll resize',  function(e){
                cloneHandler(e, $clone, $this);
			});

			$clone.stop().css({zIndex:++jQuery.imageMagnify.zIndexcounter, left:imageinfo.attrs.x, top:imageinfo.attrs.y, width:imageinfo.attrs.w, height:imageinfo.attrs.h, opacity:0, display:'block'})
				.animate({opacity:1, left: ($(window).width() === imageinfo.newattrs.w ? 0 : imageinfo.newattrs.x + setting.hIndent), top: imageinfo.newattrs.y - setting.vIndent , width:imageinfo.newattrs.w + setting.widthPad, height:imageinfo.newattrs.h + setting.heightPad}, setting.duration,
				//.animate({opacity:1, left: 0, top: '0', height: '100%', width: '100%'}, setting.duration,
				function(){ //callback function after warping is complete
                    $clone.data('$zoomStatus', '1');
                    $clone.data('$zoomInProgress', '0');
                    if(bEnforceZoomOut){
                        bEnforceZoomOut=false;
                        $clone.click();
                    }
					//none added
				}); //end animate
			}); //end click
		$clone.on('click', function(e){
				var $=jQuery;
				var $this=$(this);
				var imageinfo=$this.data('$relatedtarget').data('imgshell');
				if(!imageinfo)
                {
                    console.log('Zooming out is not working');
                    return;
                }

				$this.data('$zoomOutProgress', '1');
				jQuery.imageMagnify.refreshSize($(window), $this, imageinfo, setting);
				jQuery.imageMagnify.refreshoffsets($(window), $this.data('$relatedtarget'), imageinfo); //refresh offset positions of original and warped images

				$this.stop().animate({opacity:0, left:imageinfo.attrs.x, top:imageinfo.attrs.y + setting.vIndent, width:imageinfo.attrs.w, height:imageinfo.attrs.h },  setting.duration,
					function(){
						$this.hide();
						$this.data('$relatedtarget').css({opacity:1}); //reveal original image
						$this.data('$zoomOutProgress', '0');
                        $this.data('$zoomInProgress', '0');
                        $this.data('$zoomStatus', '0');
					}); //end animate
			}
		);
	}
};

jQuery.fn.imageMagnify=function(options){
	var $=jQuery;
	return this.each(function(){ //return jQuery obj
		var $imgref=$(this);
		if (this.tagName && this.tagName.toUpperCase()!='IMG')
			return true; //skip to next matched element
		if (parseInt($imgref.css('width'))>0 && parseInt($imgref.css('height'))>0 || options.windowFit || options.thumbdimensions ){ //if image has explicit width/height attrs defined
			jQuery.imageMagnify.magnify($, $imgref, options);
		}
		else if (this.complete){ //account for IE not firing image.onload
			jQuery.imageMagnify.magnify($, $imgref, options);
		}
		else{
			$(this).bind('load', function(){
				jQuery.imageMagnify.magnify($, $imgref, options);
			})
		}
	});
};

jQuery.fn.applyMagnifier=function(options){ //dynamic version of imageMagnify() to apply magnify effect to an image dynamically
	var $=jQuery;
	return this.each(function(){ //return jQuery obj
		var $imgref=$(this);
		if (this.tagName && this.tagName.toUpperCase()!="IMG")
			return true; //skip to next matched element
	});
};


//** The following applies the magnify effect to images with class="magnify" and optional "data-magnifyby" and "data-magnifyduration" attrs
//** It also looks for links with attr rel="magnify[targetimageid]" and makes them togglers for that image

jQuery(document).ready(function($){
	var $targets=$('.magnify');
	$targets.each(function(i){
		var $target=$(this);
		var options={};
		if ($target.attr('data-magnifyto'))
			options.magnifyto=parseFloat($target.attr('data-magnifyto'));
		if ($target.attr('data-magnifyby'))
			options.magnifyby=parseFloat($target.attr('data-magnifyby'));
		if ($target.attr('data-magnifyduration'))
			options.duration=parseInt($target.attr('data-magnifyduration'));
		$target.imageMagnify(options);
	});
	var $triggers=$('a[rel^="magnify["]');
	$triggers.each(function(i){
		var $trigger=$(this);
		var targetid=$trigger.attr('rel').match(/\[.+\]/)[0].replace(/[\[\]']/g, ''); //parse 'id' from rel='magnify[id]'
		$trigger.data('magnifyimageid', targetid);
		$trigger.click(function(e){
			$('#'+$(this).data('magnifyimageid')).trigger('click.magnify');
			e.preventDefault();
		});
	});
});

