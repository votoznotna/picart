/**
 * Created by User on 2/1/2015.
 */
/**
 * Created by User on 2/1/2015.
 */
"use strict";

angular.module('common').directive(
    "imgLazyLoad",
    function( $window, $document ) {

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
                console.log('clearRenderTimer.');
                renderTimer = null;
            }

            function startRenderTimer() {

                renderTimer = setTimeout( checkImages, renderDelay );
                console.log('startRenderTimer.');

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
            var isRendered = false;
            var height = null;

            function isVisible( topFoldOffset, bottomFoldOffset ) {
                if ( ! element.is( ":visible" ) ) {
                    return( false );
                }
                if ( height === null ) {
                    height = element.height();
                }
                var top = element.offset().top;
                var bottom = ( top + height );

                // Return true if the element is:
                // 1. The top offset is in view.
                // 2. The bottom offset is in view.
                // 3. The element is overlapping the viewport.
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

            function setSource( newSource ) {

                source = newSource;
                if ( isRendered ) {
                    renderSource();
                }
            }

            function renderSource() {
                element[ 0 ].src = source;
                jQuery(element).closest(".img-top").find('.img-spin').css('display', 'block');
            }

            // Return the public API.
            return({
                isVisible: isVisible,
                render: render,
                setSource: setSource
            });
        };

        function imgOnLoad(event){
            var magnifyby = 3.5;
            var element = event.target;
            var natHeight = element.naturalHeight;
            var natWidth = element.naturalWidth;
            var thumbHeight = natHeight / magnifyby;
            var thumbWidth = natWidth / magnifyby;
            var thumbdimensions = [thumbWidth, thumbHeight];

            jQuery(element).imageMagnify(
                {
                    vIndent: 34,
                    heightPad: -17,
                    magnifyby: magnifyby,
                    thumbdimensions: thumbdimensions
                }
            );

            jQuery(element).closest(".img-top").find('.img-spin').css('display', 'none');
            jQuery(element).closest(".img-top").find('.img-box').css({'opacity': 1});
        };

        function link( $scope, element, attributes ) {
            var lazyImage = new LazyImage( element );
            element.get(0).addEventListener("load", imgOnLoad);

            lazyLoader.addImage( lazyImage );

            attributes.$observe(
                "imgLazyLoad",
                function( newSource ) {
                    lazyImage.setSource( newSource );
                }
            );

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

