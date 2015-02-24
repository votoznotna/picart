/**
 * Created by User on 2/23/2015.
 */
'use strict';

angular.module('common').directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                element.css('visibility', 'visible');
            });
        }
    };
});
