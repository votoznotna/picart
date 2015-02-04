/**
 * Created by User on 1/24/2015.
 */

"use strict";

angular.module('common').directive('fileRequired',function(){
    return {
        restrict: 'A',
        require: 'ngModel',

        link:function(scope, el, attrs, ngModel){
            el.bind('change',function() {
                scope.$apply(function () {
                    ngModel.$setViewValue(el.val());
                    ngModel.$render();
                });
            });
        }
    }
});
