/**
 * Created by User on 1/31/2015.
 */
'use strict';

angular.module('common').directive('onFinishRenderFilters', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                    scope.$broadcast('ngRepeatFinished');
                });
            }
        }
    };
});
