/**
 * Created by User on 2/1/2015.
 */
'use strict';

//Exhibition service used for communicating with the exhibition REST endpoints
angular.module('exhibition').factory('Exhibition', ['$resource',
    function($resource) {
        return $resource('exhibition/:exhibitId', {
            articleId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);


angular.module('exhibition').factory('ExhibitMagnify', ['$timeout', function($timeout) {

        function runMagnify(elements, pollingInterval, magnifyby) {

            var loadingCount = 0;

            elements.each(function () {

                var domImg = jQuery(this).get(0);
                if (domImg.complete == false || domImg.naturalHeight == 0 || domImg.naturalWidth == 0) {
                    loadingCount++;
                } else {
                    var natHeight = domImg.naturalHeight;
                    var natWidth = domImg.naturalWidth;
                    var thumbHeight = natHeight / magnifyby;
                    var thumbWidth = natWidth / magnifyby;
                    var thumbdimensions = [thumbWidth, thumbHeight];

                    jQuery(this).imageMagnify(
                        {
                            vIndent: 55,
                            hIndent: 30,
                            magnifyby: magnifyby,
                            thumbdimensions: thumbdimensions
                        }
                    );
                }
            });

            if (loadingCount) {
                $timeout(function () {
                    runMagnify(elements, pollingInterval, magnifyby)
                }, pollingInterval);
            }
        }

        return {
            runMagnify: runMagnify
        }
    }
]);
