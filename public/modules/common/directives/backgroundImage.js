/**
 * Created by User on 2/26/2015.
 */
'use strict';

angular.module('common').directive('backgroundImage', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            var imgSrc = attrs['backgroundImage'];

            var bodyBgImage = new Image();
            bodyBgImage.src = "/modules/core/img/brand/bridge.jpg";

/*            function bodyLoaded(){
                bodyBgImage.src = "/modules/core/img/brand/bridge.jpg";
                CheckImageStatus();
            }

            function CheckImageStatus() {

                if (bodyBgImage.complete == false || bodyBgImage.naturalHeight == 0 || bodyBgImage.naturalWidth == 0) {
                    setTimeout(CheckImageStatus, 500);
                }
                else{
                    document.getElementsByTagName("html")[0].className = "bg-body";
                    document.getElementsByTagName("body")[0].className = "bg-body";
                }
            }*/



            bodyBgImage.onload = function() {
                document.getElementsByTagName("html")[0].className = "bg-body";
                document.getElementsByTagName("body")[0].className = "bg-body";
            };
        }
    };
}]);
