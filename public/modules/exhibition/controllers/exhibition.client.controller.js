/**
 * Created by User on 2/1/2015.
 */
'use strict';

angular.module('exhibition').controller('ExhibitionController',
    ['$rootScope','$scope', '$filter', '$modal', '$document', '$timeout', '$stateParams', '$state','$http',
        '$window', 'Authentication', 'Exhibition', 'ExhibitMagnify','messaging', 'events','shotDelay',
        'deviceDetector',
        function($rootScope, $scope, $filter, $modal, $document, $timeout, $stateParams, $state, $http,
                 $window, Authentication, Exhibition, ExhibitMagnify, messaging, events, shotDelay,
                 deviceDetector) {

            var timer = null, timerNext = null;

            $rootScope.searchBar = $state.current.name.toLowerCase() === 'exhibition' ? true : false;

            $rootScope.playerBar = $state.current.name.toLowerCase() === 'player' ? true : false;

            $rootScope.urlRoot = $window.urlRoot;

            $scope.oddBrowser = function(){
               return deviceDetector.raw.browser.ie ||  deviceDetector.raw.browser.firefox;
            }

            $scope.master = {};

            $scope.recaptcha = null;

            $rootScope.playerActive = false;

            $rootScope.slideIndex = 0;

            $rootScope.slidesLength = 0;

            $scope.exhibit = angular.copy($scope.master);

            $scope.authentication = Authentication;

            $scope.save = function(isUpdate) {

                $scope.$broadcast('show-errors-event');

                if ($scope.exhibitForm.$invalid)
                    return;

                var formData = new FormData();
                if(isUpdate)
                {
                    if($scope.exhibit.newPicture){
                        formData.append('image', $scope.exhibit.newPicture.file);
                    }
                    formData.append('_id', $scope.exhibit._id);
                }
                else{
                    formData.append('image', $scope.exhibit.picture.file);
                }
                formData.append('title', $scope.exhibit.title);
                formData.append('content', $scope.exhibit.content ? $scope.exhibit.content : '');
                formData.append('recaptcha', $scope.recaptcha);

                messaging.publish(events.message._SERVER_REQUEST_STARTED_);

                $http.post('upload', formData, {
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
                }).then(
                function(result) {
                    $state.go('exhibition');
                },
                function(result) {
                    $scope.hasFormError = true;
                    $scope.formErrors = result && result.data.message ? (result.data.message ? result.data.message : result.statusText) : 'Unknown error';
                }).finally(function(){
                    messaging.publish(events.message._SERVER_REQUEST_ENDED_);
                });

            };

            $scope.getPic = function(pic){
                    return 'data:' + pic.mime + ';base64,' + btoa(pic.data);
            };


            $scope.remove = function(exhibit) {
                if (exhibit)    {
                    exhibit.$remove();

                    for (var i in $scope.exhibition) {
                        if ($scope.exhibition[i] === exhibit) {
                            $scope.exhibition.splice(i, 1);
                        }
                    }
                } else {
                    $scope.exhibit.$remove(function() {
                        $state.go('exhibition');
                    });
                }
            };

            $scope.delete = function() {

                var formData = new FormData();

                formData.append('_id', $scope.exhibit._id);
                formData.append('recaptcha', $scope.recaptcha);

                messaging.publish(events.message._SERVER_REQUEST_STARTED_);

                $http.post('delete', formData, {
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
                }).then(
                function(result) {
                    for (var ind in $scope.exhibition) {
                        if ($scope.exhibition[ind] === $scope.exhibit) {
                            $scope.exhibition.splice(ind, 1);
                        }
                    }
                    $state.go('exhibition');
                },
                function(result) {
                    $scope.hasFormError = true;
                    $scope.formErrors = result && result.data.message ? (result.data.message ? result.data.message : result.statusText) : 'Unknown error';
                }).finally(function(){
                    messaging.publish(events.message._SERVER_REQUEST_ENDED_);
                });

            };

            $scope.find = function() {
                $scope.exhibition = Exhibition.query();

                $scope.exhibition.$promise.then(function(data) {
                    $rootScope.slidesLength = $filter('picRequired')(data).length;
                });
            };

            $scope.findOne = function() {
                $scope.exhibit = Exhibition.get({
                    exhibitId: $stateParams.exhibitId
                });

                $scope.exhibit.$promise.then(function(data) {
                    $scope.master = angular.copy(data);
                    jQuery('#uploadNewFile').val(data.pic.name);
                });
            };

            $scope.cancelForm = function () {
                // $window.history.back();
                $state.go('exhibition');
            };

            $scope.resetForm = function (isUpdate) {
                                $scope.$broadcast('hide-errors-event');
                $scope.clearPicture(isUpdate);
                $scope.exhibit = angular.copy($scope.master);
                $scope.hasFormError = false;
                $scope.formErrors = null;
                $scope.exhibitForm.$setPristine();
                $scope.exhibitForm.$setUntouched();
                jQuery('#uploadNewFile').val($scope.exhibit.pic.name);
            };

            $scope.clearPicture = function(isUpdate) {
                if(isUpdate){
                    $scope.exhibit.newPicture  = null;
                    angular.element(document.querySelector('#newPicture')).val('');
                    angular.element(document.querySelector('#uploadNewFile')).val('');
                }
                else{
                    $scope.exhibit.picture  = null;
                    angular.element(document.querySelector('#picture')).val('');
                    angular.element(document.querySelector('#uploadFile')).val('');
                }
            };

/*            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {

                jQuery(function() {
                    jQuery( "[title]" ).tooltip();
                });

            });*/

            function GetFilename(url)
            {
                if (url)
                {
                    var pattern = /(?=\w+\.\w{3,4}$).+/;
                    var m = pattern.exec(url.toString());
                    //var m = url.toString().match(/(?=\w+\.\w{3,4}$).+/);
                    if (m && m.length > 0)
                    {
                        return m[0];
                    }
                }
                return '';
            }

            if(document.getElementById('picture')) {
                document.getElementById('picture').onchange = function () {
                    document.getElementById('uploadFile').value = GetFilename(this.value);
                    //messaging.publish(events.message._SERVER_REQUEST_STARTED_);
                };
            }

            if(document.getElementById('newPicture')) {
                document.getElementById('newPicture').onchange = function () {
                    document.getElementById('uploadNewFile').value = GetFilename(this.value);
                    //messaging.publish(events.message._SERVER_REQUEST_STARTED_);
                };
            }

            $scope.endUpload = function () {
                messaging.publish(events.message._SERVER_REQUEST_ENDED_);
            };

            $scope.deleteConfirmation = function () {

                var modalInstance = $modal.open({
                    templateUrl: 'deleteExhibitConfirmation.html',
                    controller: 'RemoveExhibitionConfirmationController',
                    size: "sm",
                    resolve: {
                        exhibitName: function () {
                            return $scope.exhibit.title;
                        }
                    }
                });

                modalInstance.result.then(function (isConfirmed) {
                    if(isConfirmed)
                    {
                        $scope.delete();
                    }
                }, function () {

                });
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

            function nextShot(){
/*                 $rootScope.slideIndex = ($rootScope.slideIndex == $rootScope.slidesLength - 1) ? 0 : $rootScope.slideIndex + 1;
                 timer = $timeout(nextShot, shotDelay);*/
                jQuery(".rotator").eq($rootScope.slideIndex).animate({opacity: 0}, 300,
                    function() {
                        timerNext = $timeout(nextShotProc, 1);
                    }
                );
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

            $scope.$on('stopPlayer', function(){
                $rootScope.playerActive = false;
                removeTimers();
            });

            $scope.$on('prevShot', function(){
                $rootScope.playerActive = false;
                decShot();
                removeTimers();
            });

            $scope.$on('nextShot', function(){
                $rootScope.playerActive = false;
                incShot();
                removeTimers();
            });

            function removeTimers(){
                $timeout.cancel( timer );
                $timeout.cancel( timerNext );
            }

            $scope.$on(
                '$destroy',
                function( event ) {
                    removeTimers();
                }
            );
        }
    ]);
