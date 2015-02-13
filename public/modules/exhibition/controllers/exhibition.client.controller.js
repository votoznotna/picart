/**
 * Created by User on 2/1/2015.
 */
'use strict';

angular.module('exhibition').controller('ExhibitionController',
    ['$rootScope','$scope', '$filter', '$modal', '$document', '$timeout', '$stateParams', '$state','$http',
        '$window', 'Authentication', 'Exhibition', 'ExhibitMagnify','messaging', 'events',
        function($rootScope, $scope, $filter, $modal, $document, $timeout, $stateParams, $state, $http,  $window, Authentication, Exhibition, ExhibitMagnify, messaging, events) {

            var timer = null;

            $rootScope.searchBar = $state.current.name.toLowerCase() === 'exhibition' ? true : false;

            $rootScope.playerBar = $state.current.name.toLowerCase() === 'player' ? true : false;

            $rootScope.urlRoot = $window.urlRoot;

            //$rootScope.loadedSlides = [];

            $scope.master = {};

            $scope.recaptcha = null;

            $rootScope.playerActive = false;

            $scope.slideIndex = 0;

            $scope.slidesLength = 0;

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
                    $scope.slidesLength = $filter('picRequired')(data).length;
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

/*
            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                ExhibitMagnify.runMagnify(jQuery('.magnify'), 500, 3.5);
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

            function nextShot(){
                $scope.slideIndex = ($scope.slideIndex == $scope.slidesLength - 1) ? 0 : $scope.slideIndex + 1;
                timer = $timeout(nextShot, 5000);
            };

            $scope.$on('startPlayer', function(){
                if($rootScope.playerActive) {
                    nextShot();
                }
            });

            $scope.playGo = function(){
                $timeout.cancel( timer );
                $rootScope.$emit('pressStopButton');
            };

            $scope.$on('stopPlayer', function(){
                $timeout.cancel( timer );
            });


            $scope.$on(
                '$destroy',
                function( event ) {
                    $timeout.cancel( timer );
                }
            );
        }
    ]);
