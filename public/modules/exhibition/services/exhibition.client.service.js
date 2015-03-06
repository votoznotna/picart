/**
 * Created by User on 2/1/2015.
 */
'use strict';

//Exhibition service used for communicating with the exhibition REST endpoints
angular.module('exhibition').factory('Exhibition', ['$resource',
    function($resource) {
        return $resource('/exhibition/:exhibitId', {
            exhibitId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

