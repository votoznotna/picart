/**
 * Created by User on 1/29/2015.
 */
"use strict";

angular.module('common').directive('waitSpinner', function(messaging, events) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'modules/common/directives/waitSpinner.html',
        link: function(scope, element, attrs, fn) {
            element.hide();

            var startRequestHandler = function () {
                // got the request start notification, show the element
                element.show();
                angular.element('#main').css('opacity', '0.5');
            };

            var endRequestHandler = function() {
                // got the request start notification, show the element
                element.hide();
                angular.element('#main').css('opacity', '1.0');
            };

            scope.startHandle = messaging.subscribe(events.message._SERVER_REQUEST_STARTED_, startRequestHandler);
            scope.endHandle = messaging.subscribe(events.message._SERVER_REQUEST_ENDED_, endRequestHandler);

            scope.$on('$destroy', function() {
                messaging.unsubscribe(scope.startHandle);
                messaging.unsubscribe(scope.endHandle);
            });
        }
    };
});
