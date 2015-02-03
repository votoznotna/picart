/**
 * Created by User on 2/1/2015.
 */
'use strict';

angular.module('exhibition').controller('ExhibitionController',
    ['$scope', '$document', '$stateParams', '$state','$http', '$window', 'Authentication', 'Exhibition', 'ExhibitMagnify','messaging', 'events',
        function($scope, $document, $stateParams, $state, $http,  $window, Authentication, Exhibition, ExhibitMagnify, messaging, events) {

            $scope.master = {};

            $scope.recaptcha = null;

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
                formData.append('content', $scope.exhibit.content);
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
                        $scope.formErrors = result ? result.data.message : "Unknown error";
                    }).finally(function(){
                        messaging.publish(events.message._SERVER_REQUEST_ENDED_);
                    });

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

            };

            $scope.update = function() {

                $scope.$broadcast('show-errors-event');

                if ($scope.exhibitForm.$invalid)
                    return;

                var exhibit = $scope.exhibit;

                exhibit.$update(function() {
                    $state.go('exhibition');
                }, function(errorResponse) {
                    $scope.hasFormError = true;
                    $scope.formErrors = errorResponse.statusText;
                    //$scope.error = errorResponse.data.message;
                });
            };

            $scope.find = function() {
                $scope.exhibition = Exhibition.query();
            };

            $scope.findOne = function() {
                $scope.exhibit = Exhibition.get({
                    exhibitId: $stateParams.exhibitId
                });

                $scope.exhibit.$promise.then(function(data) {
                    $scope.master = angular.copy(data);
                    console.log(data);
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
            };

            $scope.clearPicture = function(isUpdate) {
                if(isUpdate){
                    $scope.exhibit.newPicture  = null;
                    angular.element(document.querySelector('#newPicture')).val("");
                    angular.element(document.querySelector('#uploadNewFile')).val("");
                }
                else{
                    $scope.exhibit.picture  = null;
                    angular.element(document.querySelector('#picture')).val("");
                    angular.element(document.querySelector('#uploadFile')).val("");
                }
            };

            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {

                ExhibitMagnify.runMagnify(jQuery('.magnify'), 500, 3.5);
            });

            function GetFilename(url)
            {
                if (url)
                {
                    var m = url.toString().match(/.*[\\\/](.+?)\./);
                    if (m && m.length > 1)
                    {
                        return m[1];
                    }
                }
                return "";
            }



            if(document.getElementById("picture")) {
                document.getElementById("picture").onchange = function () {
                    document.getElementById("uploadFile").value = GetFilename(this.value);
                };
            }

            if(document.getElementById("newPicture")) {
                document.getElementById("newPicture").onchange = function () {
                    document.getElementById("uploadNewFile").value = GetFilename(this.value);
                };
            }


        }
    ]);
