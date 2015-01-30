/**
 * Created by User on 1/19/2015.
 */
'use strict';

//Galleries service used for communicating with the galleries REST endpoints
angular.module('galleries').factory('Galleries', ['$resource',
    function($resource) {
        return $resource('galleries/:galleryId', {
            articleId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);


angular.module('galleries').factory('GalleryService', ['$http', '$q'],
    function albumService($http, $q) {
        // interface
        var service = {
            albums: [],
            getAlbums: getAlbums
        };
        return service;

        // implementation
        function getAlbums() {
            var def = $q.defer();

            $http.get("./albums.ms")
                .success(function(data) {
                    service.albums = data;
                    def.resolve(data);
                })
                .error(function() {
                    def.reject("Failed to get albums");
                });
            return def.promise;
        }
    });
