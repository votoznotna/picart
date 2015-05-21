/**
 * Created by User on 2/1/2015.
 */
/**
 * Created by User on 2/1/2015.
 */
"use strict";

angular.module('common').directive(
    "imgLazyLoad",
    function( $window, $document, $rootScope ) {

        var lazyLoader = (function() {

            var images = [];

            // Define the render timer for the lazy loading
            // images to that the DOM-querying (for offsets)
            // is chunked in groups.
            var renderTimer = null;
            var renderDelay = 100;

            // I cache the window element as a jQuery reference.
            var win = jQuery( $window );

            // Cache the document document height so that
            // we can respond to changes in the height due to
            // dynamic content.
            var doc = $document;
            var documentHeight = doc.height();
            var documentTimer = null;
            var documentDelay = 2000;

            // I determine if the window dimension events
            // (ie. resize, scroll) are currenlty being
            // monitored for changes.
            var isWatchingWindow = false;

            function addImage( image ) {

                images.push( image );

                if ( ! renderTimer ) {
                    startRenderTimer();
                }

                if ( ! isWatchingWindow ) {
                    startWatchingWindow();
                }
            }

            function removeImage( image ) {

                // Remove the given image from the render queue.
                for ( var i = 0 ; i < images.length ; i++ ) {
                    if ( images[ i ] === image ) {
                        images.splice( i, 1 );
                        break;
                    }
                }

                // If removing the given image has cleared the
                // render queue, then we can stop monitoring
                // the window and the image queue.
                if ( ! images.length ) {
                    clearRenderTimer();
                    stopWatchingWindow();
                }
            }

            function checkDocumentHeight() {
                // If the render time is currently active, then
                // don't bother getting the document height -
                // it won't actually do anything.
                if ( renderTimer ) {
                    return;
                }

                var currentDocumentHeight = doc.height();
                // If the height has not changed, then ignore -
                // no more images could have come into view.
                if ( currentDocumentHeight === documentHeight ) {
                    return;
                }

                // Cache the new document height.
                documentHeight = currentDocumentHeight;
                startRenderTimer();
            }

            function checkImages() {

                // Log here so we can see how often this
                // gets called during page activity.
                //console.log( "Checking for visible images..." );

                var visible = [];
                var hidden = [];

                // Determine the window dimensions.
                var windowHeight = win.height();
                var scrollTop = win.scrollTop();

                // Calculate the viewport offsets.
                var topFoldOffset = scrollTop;
                var bottomFoldOffset = ( topFoldOffset + windowHeight );

                for ( var i = 0 ; i < images.length ; i++ ) {
                        var image = images[ i ];
                    if ( image.isVisible( topFoldOffset, bottomFoldOffset ) ) {
                        visible.push( image );
                    } else {
                        hidden.push( image );
                    }
                }

                // Update the DOM with new image source values.
                for ( var i = 0 ; i < visible.length ; i++ ) {
                    visible[ i ].render();
                }
                images = hidden;

                clearRenderTimer();

                if ( ! images.length ) {
                    stopWatchingWindow();
                }
            }

            function clearRenderTimer() {
                clearTimeout( renderTimer );
                renderTimer = null;
            }

            function startRenderTimer() {
                renderTimer = setTimeout( checkImages, renderDelay );
            }

            function startWatchingWindow() {
                isWatchingWindow = true;
                // Listen for window changes.
                win.on( "resize.imgLazyLoad", windowChanged );
                win.on( "scroll.imgLazyLoad", windowChanged );
                // Set up a timer to watch for document-height changes.
                documentTimer = setInterval( checkDocumentHeight, documentDelay );
            }

            // I stop watching the window for changes in dimension.
            function stopWatchingWindow() {
                isWatchingWindow = false;
                // Stop watching for window changes.
                win.off( "resize.imgLazyLoad" );
                win.off( "scroll.imgLazyLoad" );
                // Stop watching for document changes.
                clearInterval( documentTimer );
            }

            // I start the render time if the window changes.
            function windowChanged() {
                if ( ! renderTimer ) {
                    startRenderTimer();
                }
            }

            // Return the public API.
            return({
                addImage: addImage,
                removeImage: removeImage
            });

        })();

        // ------------------------------------------ //
        // ------------------------------------------ //

        function LazyImage( element ) {

            var source = null;
            var fromMinToMax = false;
            var isRendered = false;
            var height = null;

            function isVisible( topFoldOffset, bottomFoldOffset ) {
                var topElem =  element.closest('.img-top');
                var testedElem = topElem.length ? topElem : element;
                if ( ! testedElem.is( ":visible" ) ) {
                    return false;
                }
                if ( height === null ) {
                    height = testedElem.height();
                }
                var top = testedElem.offset().top;
                var bottom = ( top + height );

                return(
                (
                ( top <= bottomFoldOffset ) &&
                ( top >= topFoldOffset )
                )
                ||
                (
                ( bottom <= bottomFoldOffset ) &&
                ( bottom >= topFoldOffset )
                )
                ||
                (
                ( top <= topFoldOffset ) &&
                ( bottom >= bottomFoldOffset )
                )
                );

            }

            function render() {
                isRendered = true;
                renderSource();
            }

            function setSource( newSource, fromMinToMax ) {

                source = newSource;
                if ( isRendered ) {
                    renderSource(fromMinToMax);
                }
            }

            function renderSource(fromMinToMax){

                var elem = element[0];
                elem.src = source;
                var $imgTop = jQuery(elem).closest(".img-top");
                if($imgTop.length == 0) return;
                if(!elem.complete || !elem.naturalWidth || !elem.naturalHeight ||
                    fromMinToMax  ) {
                    $imgTop.find('.rotator').css('display', 'none');
                    if(fromMinToMax) {
                        $imgTop.find('.img-max-spin').css('display', 'block');
                    }
                    else {
                        $imgTop.find('.img-spin').css('display', 'block');
                    }
                    $rootScope.$broadcast('imgStartedLoading');
                }
                else  {
                    $imgTop.find('.img-box-player').css({ opacity: 1 });
                }
            }

            // Return the public API.
            return({
                isVisible: isVisible,
                render: render,
                setSource: setSource
            });
        };


        function imgOnLoad(event) {

            var element = event.target;
            var $element = jQuery(element);
            var isExpress = $element.attr('src').toLowerCase().indexOf('mpic') >= 0 ? true : false;

            var magnifyby = 3.5;
            var natHeight = element.naturalHeight;
            var natWidth = element.naturalWidth;
            var thumbHeight = natHeight / magnifyby;
            var thumbWidth = natWidth / magnifyby;
            var thumbdimensions = [thumbWidth, thumbHeight];

            if(!isExpress){
                $element.imageMagnify(
                    {
                        vIndent: 5,
                        heightPad: 5,
                        magnifyby: magnifyby,
                        thumbdimensions: thumbdimensions
                    }
                );
            }

            var $imgTop = $element.closest(".img-top");
            if($imgTop.length == 0) return;
            $imgTop.find('.img-spin').css('display', 'none');
            $imgTop.find('.img-max-spin').css('display', 'none');

            $imgTop.find('.img-box').css({'display': 'block'})
            $imgTop.find('.img-box').css({'opacity': 1});
            var isPlayer =  $imgTop.find('.img-box-player').length > 0 ||  $imgTop.find('.img-spin-player').length > 0  ? true : false;
            if(isPlayer)
            {
                $imgTop.find('.rotator').css('display', 'block');
                $imgTop.find('.img-box-player').css({'opacity': 1});
                $rootScope.$broadcast('imgEndedLoading');
            }
            else{
                var src = $element.attr('src');
                if(src.indexOf('mpic') >= 0) return;
                if($element.is(':visible')){
                    $element.trigger('click');
                }
            }
        };

        function link( $scope, element, attrs ) {

            var slideNumber = attrs["slideNumber"] ? parseInt(attrs["slideNumber"]) : 0;
            var isPlayer = attrs["player"] ? JSON.parse(attrs["player"]) : false;

            var lazyImage = new LazyImage( element );
            if(!isPlayer) {
                lazyLoader.addImage( lazyImage );
            }

            element.get(0).addEventListener("load", imgOnLoad);

            attrs.$observe(
                "imgLazyLoad",
                function( newSource ) {
                    lazyImage.setSource( newSource );
                    if(isPlayer)  {
                        lazyImage.render();
                    }
                }
            );

            element.bind('click',function(event){
                if(isPlayer) return;
                var element = event.target;
                var $element = jQuery(element);
                var src = $element.attr('src');
                if(src.indexOf('mpic') == -1) return;
                var src  = src.replace('mpic', 'pic');
                var $imgTop = $element.closest(".img-top");
                if($imgTop.length == 0) return;
                $imgTop.find('.img-box').css({'display': 'none'})
                lazyImage.setSource( src, true );
            });


            $scope.$on(
                "minPicClick",
                function(event, args) {
                    console.log(args);

                }
            )

            $scope.$on(
                "$destroy",
                function() {
                    lazyLoader.removeImage( lazyImage );
                }
            );
        }

        // Return the directive configuration.
        return({
            link: link,
            restrict: "A"
        });
    }
);

