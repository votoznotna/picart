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
