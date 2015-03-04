/**
 * Created by User on 3/4/2015.
 */
angular.module('common').controller('BaseCtrl',
    [ '$scope', '$location', 'messaging', 'events', 'deviceDetector',
    function ($scope, $location, messaging, events, deviceDetector) {
        //#region login methods
        $scope.oddBrowser = function () {
            return deviceDetector.raw.browser.ie || deviceDetector.raw.browser.firefox;
        }
    }
]);

