/**
 * Created by User on 2/6/2015.
 */
'use strict';
angular.module('common').directive('imgLoaded', function () {
    return {
        restrict: 'A',

        link: function(scope, element, attrs) {

            element.bind('load' , function(e){
                element.closest('.img-box').css('opacity', 1);
            });
        }
    }
});
