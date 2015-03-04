/**
 * Created by User on 2/1/2015.
 */
'use strict';

angular.module('exhibition').controller('ExhibitionController',
    ['$rootScope','$scope', '$filter', '$modal', '$document', '$timeout', '$stateParams', '$state','$http',
        '$controller', '$window', 'Authentication', 'Exhibition', 'ExhibitMagnify','messaging', 'events','shotDelay',
        'deviceDetector',
        function($rootScope, $scope, $filter, $modal, $document, $timeout, $stateParams, $state, $http,
                 $controller, $window, Authentication, Exhibition, ExhibitMagnify, messaging, events, shotDelay,
                 deviceDetector) {

            $controller('BaseCtrl', {$scope: $scope});

            var timer = null, timerNext = null;

            $rootScope.searchBar = ($state.current.name.toLowerCase() === 'exhibition') ? true : false;

            $rootScope.playerBar = $state.current.name.toLowerCase() === 'player' ? true : false;

            $rootScope.urlRoot = $window.urlRoot;

            $scope.timeoutDelay = false;

            $scope.imageWasNotInCache = false;

/*            $scope.oddBrowser = function(){
               return deviceDetector.raw.browser.ie ||  deviceDetector.raw.browser.firefox;
            }*/

            $rootScope.playerActive = false;

            $rootScope.slideIndex = 0;

            $rootScope.slidesLength = 0;

            $scope.authentication = Authentication;

            $scope.find = function() {
                $rootScope.exhibition = Exhibition.query();

                $scope.exhibition.$promise.then(function(data) {
                    $rootScope.slidesLength = $filter('picRequired')(data).length;
                    if($rootScope.playerBar) {
                        $scope.startPlay();
                    }

                    if($rootScope.searchBar && $rootScope.slidesLength){
                        var tags = [], lowerTags = [];
                        for(var index = 0; index < data.length; index++){
                            var item = data[index];
                            var sItems = [item.title.trim(), item.content.trim()];
                            for(var ind = 0; ind < sItems.length; ind++){
                                var txt = sItems[ind];
                                if(!txt) continue;
                                var txtLower = txt.toLowerCase();
                                if(lowerTags.indexOf(txtLower) != -1) continue;
                                tags.push(txt); lowerTags.push(txtLower);
                            }
                        }

                        if(tags.length) tags.sort();

                        jQuery( "#searchBox" ).autocomplete({
                            minLength: 2,
                            source: tags
                        });
                    }

                });
            };

            $scope.imgCached = function(url) {
                var test = document.createElement("img");
                test.src = url;
                return test.complete && test.naturalWidth && test.naturalWidth;
            }

            $scope.$on('serverRequestEnded', function(){
                $scope.endUpload();
            });

            $scope.endUpload = function () {
                messaging.publish(events.message._SERVER_REQUEST_ENDED_);
            };

            function enableShot(){
                jQuery(".rotator").eq($rootScope.slideIndex).css({opacity: 1});
            }

            function incShot(){
                $rootScope.slideIndex = ($rootScope.slideIndex == $rootScope.slidesLength - 1) ? 0 : $rootScope.slideIndex + 1;
                enableShot();
            }

            function decShot(){
                $rootScope.slideIndex = ($rootScope.slideIndex == 0) ? $rootScope.slidesLength - 1 : $rootScope.slideIndex - 1;
                enableShot();
            }

            function nextShotProc(){
                $rootScope.slideIndex = ($rootScope.slideIndex == $rootScope.slidesLength - 1) ? 0 : $rootScope.slideIndex + 1;
                jQuery(".rotator").eq($rootScope.slideIndex).animate({opacity: 1}, 300, function () {
                    timer = $timeout(nextShot, shotDelay);
                });
            }

            function nextShot() {
                if ($scope.timeoutDelay) {
                    timer = $timeout(nextShot, shotDelay);

                }
                else if($scope.imageWasNotInCache){
                    $scope.imageWasNotInCache = false;
                    timer = $timeout(nextShot, shotDelay / 3);
                }
                else {
                    jQuery(".rotator").eq($rootScope.slideIndex).animate({opacity: 0}, 300,
                        function () {
                            timerNext = $timeout(nextShotProc, 0);
                        }
                    );
                }
            }

            $scope.startPlay = function(){
                $rootScope.playerActive = true;
                timer = $timeout(nextShot, shotDelay);
            }

            $scope.$on('startPlayer', function(){
                $scope.startPlay();
            });

            $scope.stopPlay = function(){
                removeTimers();
                $rootScope.playerActive = false;
            };

            $scope.togglePlay = function(){
                if($rootScope.playerActive) {
                    $scope.stopPlay();
                }
                else{
                    $scope.startPlay();
                }
            };

            $scope.$on('imgStartedLoading', function(){
                if($rootScope.playerActive) {
                    $scope.imageWasNotInCache = true;
                    $scope.timeoutDelay = true;
                }
            });

            $scope.$on('imgEndedLoading', function(){
                if($rootScope.playerActive) {
                    $scope.timeoutDelay = false;
                }
            });

            $scope.$on('stopPlayer', function(){
                $rootScope.playerActive = false;
                removeTimers();
            });

            $scope.$on('prevShot', function(){
                removeTimers();
                $rootScope.playerActive = false;
                decShot();
            });

            $scope.$on('nextShot', function(){
                removeTimers();
                $rootScope.playerActive = false;
                incShot();
            });

            function removeTimers(){
                $scope.imageWasNotInCache = false;
                $scope.timeoutDelay = false;
                $timeout.cancel( timer );
                $timeout.cancel( timerNext );
            }

            $scope.$on('ngRepeatFinished', function(){

            });

            $scope.$on(
                '$destroy',
                function( event ) {
                    removeTimers();
                }
            );
        }
    ]);
