'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'picart';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',
		'ui.router', 'ui.bootstrap', 'ui.utils', 'ng.deviceDetector', 'grecaptcha'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName)
	.config(['$locationProvider',
		function($locationProvider) {
			$locationProvider.html5Mode(true);
			$locationProvider.hashPrefix('!');
		}
	])
	.config(["grecaptchaProvider", function(grecaptchaProvider) {
		grecaptchaProvider.setParameters({
			sitekey : window.recaptchaSiteKey,
			theme: 'light'
		})
	}])
	.value('shotDelay', 6000)
	.run(["mongolab", function (mongolab) {
		mongolab.setApiKey(window.mongolabApiKey);
	}])
	.run(['$state', '$rootScope', '$location', function($state, $rootScope, $location) {
		//Check when routing starts
		//event, next, current
		$rootScope.$on( '$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
			$rootScope.searchBar = false;
			$rootScope.playerBar = false;
		});
	}]);


//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

/**
 * Created by User on 1/22/2015.
 */
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('common');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
/**
 * Created by User on 2/1/2015.
 */
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('exhibition',['common', 'imageupload']);


'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
/**
 * Created by User on 1/24/2015.
 */

'use strict';

angular.module('common').directive('fileRequired',function(){
    return {
        restrict: 'A',
        require: 'ngModel',

        link:function(scope, el, attrs, ngModel){
            el.bind('change',function() {
                scope.$apply(function () {
                    ngModel.$setViewValue(el.val());
                    ngModel.$render();
                });
            });
        }
    };
});

/**
 * Created by User on 2/1/2015.
 */
/**
 * Created by User on 2/1/2015.
 */
"use strict";

angular.module('common').directive(
    "imgLazyLoad",
    ["$window", "$document", "$rootScope", function( $window, $document, $rootScope ) {

        var lazyLoader = (function() {

            var images = [];

            // Define the render timer for the lazy loading
            // images to that the DOM-querying (for offsets)
            // is chunked in groups.
            var renderTimer = null;
            var renderDelay = 100;

            // I cache the window element as a jQuery reference.
            var win = jQuery( $window );

            // Cache the document document height so that
            // we can respond to changes in the height due to
            // dynamic content.
            var doc = $document;
            var documentHeight = doc.height();
            var documentTimer = null;
            var documentDelay = 2000;

            // I determine if the window dimension events
            // (ie. resize, scroll) are currenlty being
            // monitored for changes.
            var isWatchingWindow = false;

            function addImage( image ) {

                images.push( image );

                if ( ! renderTimer ) {
                    startRenderTimer();
                }

                if ( ! isWatchingWindow ) {
                    startWatchingWindow();
                }
            }

            function removeImage( image ) {

                // Remove the given image from the render queue.
                for ( var i = 0 ; i < images.length ; i++ ) {
                    if ( images[ i ] === image ) {
                        images.splice( i, 1 );
                        break;
                    }
                }

                // If removing the given image has cleared the
                // render queue, then we can stop monitoring
                // the window and the image queue.
                if ( ! images.length ) {
                    clearRenderTimer();
                    stopWatchingWindow();
                }
            }

            function checkDocumentHeight() {
                // If the render time is currently active, then
                // don't bother getting the document height -
                // it won't actually do anything.
                if ( renderTimer ) {
                    return;
                }

                var currentDocumentHeight = doc.height();
                // If the height has not changed, then ignore -
                // no more images could have come into view.
                if ( currentDocumentHeight === documentHeight ) {
                    return;
                }

                // Cache the new document height.
                documentHeight = currentDocumentHeight;
                startRenderTimer();
            }

            function checkImages() {

                // Log here so we can see how often this
                // gets called during page activity.
                //console.log( "Checking for visible images..." );

                var visible = [];
                var hidden = [];

                // Determine the window dimensions.
                var windowHeight = win.height();
                var scrollTop = win.scrollTop();

                // Calculate the viewport offsets.
                var topFoldOffset = scrollTop;
                var bottomFoldOffset = ( topFoldOffset + windowHeight );

                for ( var i = 0 ; i < images.length ; i++ ) {
                        var image = images[ i ];
                    if ( image.isVisible( topFoldOffset, bottomFoldOffset ) ) {
                        visible.push( image );
                    } else {
                        hidden.push( image );
                    }
                }

                // Update the DOM with new image source values.
                for ( var i = 0 ; i < visible.length ; i++ ) {
                    visible[ i ].render();
                }
                images = hidden;

                clearRenderTimer();

                if ( ! images.length ) {
                    stopWatchingWindow();
                }
            }

            function clearRenderTimer() {
                clearTimeout( renderTimer );
                renderTimer = null;
            }

            function startRenderTimer() {
                renderTimer = setTimeout( checkImages, renderDelay );
            }

            function startWatchingWindow() {
                isWatchingWindow = true;
                // Listen for window changes.
                win.on( "resize.imgLazyLoad", windowChanged );
                win.on( "scroll.imgLazyLoad", windowChanged );
                // Set up a timer to watch for document-height changes.
                documentTimer = setInterval( checkDocumentHeight, documentDelay );
            }

            // I stop watching the window for changes in dimension.
            function stopWatchingWindow() {
                isWatchingWindow = false;
                // Stop watching for window changes.
                win.off( "resize.imgLazyLoad" );
                win.off( "scroll.imgLazyLoad" );
                // Stop watching for document changes.
                clearInterval( documentTimer );
            }

            // I start the render time if the window changes.
            function windowChanged() {
                if ( ! renderTimer ) {
                    startRenderTimer();
                }
            }

            // Return the public API.
            return({
                addImage: addImage,
                removeImage: removeImage
            });

        })();

        // ------------------------------------------ //
        // ------------------------------------------ //

        function LazyImage( element ) {

            var source = null;
            var isRendered = false;
            var height = null;

            function isVisible( topFoldOffset, bottomFoldOffset ) {
                var topElem =  element.closest('.img-top');
                var testedElem = topElem.length ? topElem : element;
                if ( ! testedElem.is( ":visible" ) ) {
                    return false;
                }
                if ( height === null ) {
                    height = testedElem.height();
                }
                var top = testedElem.offset().top;
                var bottom = ( top + height );

                return(
                (
                ( top <= bottomFoldOffset ) &&
                ( top >= topFoldOffset )
                )
                ||
                (
                ( bottom <= bottomFoldOffset ) &&
                ( bottom >= topFoldOffset )
                )
                ||
                (
                ( top <= topFoldOffset ) &&
                ( bottom >= bottomFoldOffset )
                )
                );

            }

            function render() {
                isRendered = true;
                renderSource();
            }

            function setSource( newSource ) {

                source = newSource;
                if ( isRendered ) {
                    renderSource();
                }
            }

            function renderSource(){

                var elem = element[0];
                elem.src = source;
                var $imgTop = jQuery(elem).closest(".img-top");
                if(!elem.complete || !elem.naturalWidth || !elem.naturalHeight) {
                    $imgTop.find('.rotator').css('display', 'none');
                    $imgTop.find('.img-spin').css('display', 'block');
                    $rootScope.$broadcast('imgStartedLoading');
                }
                else  {
                    $imgTop.find('.img-box-player').css({ opacity: 1 });
                }
            }

            function renderSourceTimeOut() {
                setTimeout(function(){renderSource()}, 1);
            };

            // Return the public API.
            return({
                isVisible: isVisible,
                render: render,
                setSource: setSource
            });
        };


        function imgOnLoad(event) {

            var element = event.target;
            var $element = jQuery(element);
            var isExpress = $element.attr('src').toLowerCase().indexOf('mpic') >= 0 ? true : false;

            var magnifyby = 3.5;
            var natHeight = element.naturalHeight;
            var natWidth = element.naturalWidth;
            var thumbHeight = natHeight / magnifyby;
            var thumbWidth = natWidth / magnifyby;
            var thumbdimensions = [thumbWidth, thumbHeight];

            if(!isExpress){
                $element.imageMagnify(
                    {
                        vIndent: 34,
                        heightPad: -17,
                        magnifyby: magnifyby,
                        thumbdimensions: thumbdimensions
                    }
                );
            }

            var $imgTop = $element.closest(".img-top");
            $imgTop.find('.img-spin').css('display', 'none');

            $imgTop.find('.img-box').css({'display': 'block'})
            $imgTop.find('.img-box').css({'opacity': 1});
            var isPlayer =  $imgTop.find('.img-box-player').length > 0 ? true : false;
            if(isPlayer)
            {
                $imgTop.find('.rotator').css('display', 'block');
                $imgTop.find('.img-box-player').css({'opacity': 1});
                $rootScope.$broadcast('imgEndedLoading');
            }
            else{
                var src = $element.attr('src');
                if(src.indexOf('mpic') >= 0) return;
                $element.trigger('click');
            }


            //$imgTop.addClass('maxImgLoaded');

/*            jQuery(element).tooltip(
                {
                    position: {
                        my: "left top",
                        at: "right+5 top-5"
                    }
                });*/
            //$rootScope.loadedSlides.push($element.attr('src').toLowerCase())
        };

        function link( $scope, element, attrs ) {

            var slideNumber = attrs["slideNumber"] ? parseInt(attrs["slideNumber"]) : 0;
            var isPlayer = attrs["player"] ? JSON.parse(attrs["player"]) : false;

            var lazyImage = new LazyImage( element );
            if(!isPlayer) {
                lazyLoader.addImage( lazyImage );
            }

            element.get(0).addEventListener("load", imgOnLoad);

            attrs.$observe(
                "imgLazyLoad",
                function( newSource ) {
                    lazyImage.setSource( newSource );
                    if(isPlayer)  {
                        lazyImage.render();
                    }
                }
            );

            element.bind('click',function(event){
                if(isPlayer) return;
                var element = event.target;
                var $element = jQuery(element);
                var src = $element.attr('src');
                if(src.indexOf('mpic') == -1) return;
                var src  = src.replace('mpic', 'pic');
                var $imgTop = $element.closest(".img-top");
                $imgTop.find('.img-box').css({'display': 'none'})
                lazyImage.setSource( src );
            });


            $scope.$on(
                "minPicClick",
                function(event, args) {
                    console.log(args);

                }
            )

            $scope.$on(
                "$destroy",
                function() {
                    lazyLoader.removeImage( lazyImage );
                }
            );
        }

        // Return the directive configuration.
        return({
            link: link,
            restrict: "A"
        });
    }]
);


/**
 * Created by User on 2/6/2015.
 */
'use strict';
angular.module('common').directive('imgLoaded', function () {
    return {
        restrict: 'A',

        link: function(scope, element, attrs) {

            element.bind('load' , function(e){
                element.closest('.img-box').css('opacity', 1);
            });
        }
    }
});

/**
 * Created by User on 1/31/2015.
 */
'use strict';

angular.module('common').directive('onFinishRenderFilters', ["$timeout", function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                    scope.$broadcast('ngRepeatFinished');
                });
            }
        }
    };
}]);

/**
 * Created by User on 1/22/2015.
 */

'use strict';

angular.module('common').directive('showErrors', ['$timeout', function ($timeout) {

    return {
        restrict: 'A',
        require: '^form',
        link: function (scope, el, attrs, formCtrl) {

            // find the text box element, which has the 'name' attribute
            var inputEl = el[0].querySelector('[name]');

            // convert the native text box element to an angular element
            var inputNgEl = angular.element(inputEl);

            // get the name on the text box so we know the property to check
            // on the form controller
            var inputName = inputNgEl.attr('name');

            // only apply the has-error class after the user leaves the text box
            inputNgEl.bind('blur', function () {
                el.toggleClass('has-error', formCtrl[inputName].$invalid);
            });

            scope.$on('show-errors-event', function () {
                el.toggleClass('has-error', formCtrl[inputName].$invalid);
            });

            scope.$on('hide-errors-event', function () {
                $timeout(function () {
                    el.removeClass('has-error');
                }, 0, false);
            });
        }
    };
}]);

/**
 * Created by User on 1/24/2015.
 */
'use strict';

angular.module('common').directive('uniqueName', ["mongolab", function(mongolab) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {

            var mongoDbCollection = attrs['mongoCollection'];
            var mongoDbName = window.dbName;

            var getByNameSuccessHandler = function (response) {
                if(response.data && response.data.length > 0) {
                    ctrl.$setValidity('uniqueName', false);
                }
                else{
                    ctrl.$setValidity('uniqueName', true);
                }
            };

            var getByNameErrorHandler = function () {
                ctrl.$setValidity('uniqueName', true);
            };

            ctrl.$parsers.unshift(function (viewValue) {
                // do nothing unless we match a valid name
                if ((viewValue !== null) && (viewValue !== undefined) && (viewValue !== '')) {
                    mongolab.query(mongoDbName, mongoDbCollection, {q: {title_searchable: viewValue.toLowerCase()}})
                        .then(getByNameSuccessHandler, getByNameErrorHandler);
                }

                return viewValue;
            });
        }
    };
}]);

/**
 * Created by User on 1/29/2015.
 */
'use strict';

angular.module('common').directive('waitSpinner', ["messaging", "events", function(messaging, events) {
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
}]);

/**
 * Created by User on 1/29/2015.
 */
'use strict';

angular.module('common').constant('events', {
    message: {
        _ADD_ERROR_MESSAGE_: '_ADD_ERROR_MESSAGE_',
        _CLEAR_ERROR_MESSAGES_: '_CLEAR_ERROR_MESSAGES_',
        _ERROR_MESSAGES_UPDATED_: '_ERROR_MESSAGES_UPDATED_',
        _ADD_USER_MESSAGE_: '_ADD_USER_MESSAGE_',
        _CLEAR_USER_MESSAGES_: '_CLEAR_USER_MESSAGES_',
        _USER_MESSAGES_UPDATED_: '_USER_MESSAGES_UPDATED_',
        _SERVER_REQUEST_STARTED_: '_SERVER_REQUEST_STARTED_',
        _SERVER_REQUEST_ENDED_: '_SERVER_REQUEST_ENDED_',
        _LOG_TRACE_: '_LOG_TRACE_',
        _LOG_DEBUG_: '_LOG_DEBUG_',
        _LOG_INFO_: '_LOG_INFO_',
        _LOG_WARNING_: '_LOG_WARNING_',
        _LOG_ERROR_: '_LOG_ERROR_',
        _LOG_FATAL_: '_LOG_FATAL_'
    }
});

/**
 * Created by User on 1/29/2015.
 */
'use strict';

angular.module('common').factory('messaging', function () {
    //#region Internal Methods
    var cache = {};

    var subscribe = function (topic, callback) {
        if (!cache[topic]) {
            cache[topic] = [];
        }
        cache[topic].push(callback);
        return [topic, callback];
    };

    var publish = function (topic, args) {
        if (cache[topic]) {
            angular.forEach(cache[topic], function (callback) {
                callback.apply(null, args || []);
            });
        }
    };

    var unsubscribe = function (handle) {
        var t = handle[0];
        if (cache[t]) {
            for(var x = 0; x < cache[t].length; x++)
            {
                if (cache[t][x] === handle[1]) {
                    cache[t].splice(x, 1);
                }
            }
        }
    };

    //#endregion

    // Define the functions and properties to reveal.
    var service = {
        publish: publish,
        subscribe: subscribe,
        unsubscribe: unsubscribe
    };

    return service;
});

/**
 * Created by User on 1/24/2015.
 */
'use strict';

angular.module('common').factory('mongolab', ["$http", function ($http) {
    var apiKey = '';
    var baseUrl = 'https://api.mongolab.com/api/1/databases';

    /**
     * sets the mongolab.com api key to use for authenticaiton with service
     * @param apikey - mongolab api key
     */
    var setApiKey = function (apikey) {
        apiKey = apikey;
    };

    /**
     * returns the current api key used for authentication with service
     * @returns {string} - mongolab api key
     */
    var getApiKey = function () {
        return apiKey;
    };

    /**
     * sets the base url of the mongolab service
     * @param uri - mongolab url
     */
    var setBaseUrl = function (uri) {
        baseUrl = uri;
    };

    /**
     * returns the current base url of the mongolab service
     * @returns {string} - mongolab url
     */
    var getBaseUrl = function () {
        return baseUrl;
    };

    /**
     * performs a generic query against mongolab
     * @param database - mongolab database
     * @param collection - collection in database to query
     * @param parameters - query parameters used for the query
     * @returns {*} - a promise for the $http call
     */
    var query = function (database, collection, parameters) {
        parameters = parameters || {};
        parameters['apiKey'] = apiKey;
        var uri = baseUrl + '/' + database + '/collections/' + collection;
        return $http({method: 'GET', url: uri, params: parameters, cache: false});
    };

    /**
     * performs a query on a collection by object id
     * @param database - mongolab database
     * @param collection - collection in database to query
     * @param id - id of the object to retrieve
     * @param parameters - query parameters used for the query
     * @returns {*} - a promise for the $http call
     */
    var queryById = function (database, collection, id, parameters) {
        parameters = parameters || {};
        parameters['apiKey'] = apiKey;
        var uri = baseUrl + '/' + database + '/collections/' + collection + '/' + id;
        return $http({method: "GET", url: uri, params: parameters, cache: false});
    };

    /**
     * create a new object in the given collection
     * @param database - mongolab database
     * @param collection - collection in database to create object in
     * @param object - object to insert into collection
     * @returns {*} - a promise for the $http call
     */
    var createObject = function (database, collection, object) {
        var uri = baseUrl + '/' + database + '/collections/' + collection + '?apiKey=' + apiKey;
        return $http({method: 'POST', url: uri, data: angular.toJson(object), cache: false});
    };

    /**
     * updates an object in the given collection
     * @param database - mongolab database
     * @param collection - collection in database to update object in
     * @param object - object to update in collection
     * @returns {*} - a promise for the $http call
     */
    var updateObject = function (database, collection, object) {
        var uri = baseUrl + '/' + database + '/collections/' + collection + '/' + object._id.$oid + '?apiKey=' + apiKey;
        delete object._id;
        return $http({method: 'PUT', url: uri, data: angular.toJson(object), cache: false});
    };

    /**
     * deletes an object in the given collection
     * @param database - mongolab database
     * @param collection - collection in database to delete object from
     * @param object - object to delete in collection
     * @returns {*} - a promise for the $http call
     */
    var deleteObject = function (database, collection, object) {
        var uri = baseUrl + '/' + database + '/collections/' + collection + '/' + object._id.$oid + '?apiKey=' + apiKey;
        return $http({method: 'DELETE', url: uri, cache: false});
    };

    var mongolab = {
        setApiKey: setApiKey,
        getApiKey: getApiKey,
        setBaseUrl: setBaseUrl,
        getBaseUrl: getBaseUrl,
        query: query,
        queryById: queryById,
        create: createObject,
        update: updateObject,
        delete: deleteObject
    };

    return mongolab;
}]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', 'Authentication', 'Menus',
	function($rootScope, $scope, Authentication, Menus) {

		$rootScope.exhibitQuery = '';

		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		$scope.searchExhibits = function(){

			$rootScope.exhibitQuery = $scope.query;
		}

		$scope.clearSearch = function(){
			$scope.query = '';
		}

		$scope.playGo = function(value){
			var action = value ? 'startPlayer' : 'stopPlayer';
			$rootScope.$broadcast(action);
			angular.element('body').trigger('click');
		}

		$scope.playPrev = function(){
			$rootScope.$broadcast('prevShot');
			angular.element('body').trigger('click');
		}

		$scope.playNext = function(){
			$rootScope.$broadcast('nextShot');
			angular.element('body').trigger('click');
		}

		$scope.signout = function(){
			window.location.href = "/auth/signout";
		}
	}
]);

'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
	}


]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar', true);
	}
]);

/**
 * Created by User on 2/1/2015.
 */
'use strict';

// Configuring the Articles module
angular.module('exhibition').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Exhibition', 'exhibition', null, null, true);
        //Menus.addMenuItem('topbar', 'Exhibition', 'exhibition', 'dropdown', null, true);
        //Menus.addSubMenuItem('topbar', 'exhibition', 'Minimal Load', 'exhibition/express', null, true);
        //Menus.addSubMenuItem('topbar', 'exhibition', 'Full Load', 'exhibition', null, true);
        Menus.addMenuItem('topbar', 'Player', 'player', null, null, true);
        Menus.addMenuItem('topbar', 'New Exhibit', 'exhibition/create', null, null, false);
    }
]);

/**
 * Created by User on 2/1/2015.
 */
'use strict';

// Setting up route
angular.module('exhibition').config(['$stateProvider',
    function($stateProvider) {
        // Exhibition state routing
        $stateProvider.
            state('exhibition', {
                url: '/exhibition',
                templateUrl: 'modules/exhibition/views/list-exhibition.client.view.html'
            }).
            state('exhibitionExpress', {
                url: '/exhibition/express',
                templateUrl: 'modules/exhibition/views/list-exhibition.client.view.html'
            }).
            state('player', {
                url: '/player',
                templateUrl: 'modules/exhibition/views/player-exhibition.client.view.html'
            }).
            state('createExhibit', {
                url: '/exhibition/create',
                templateUrl: 'modules/exhibition/views/create-exhibit.client.view.html'
            }).
            state('viewExhibit', {
                url: '/exhibition/:exhibitId',
                templateUrl: 'modules/exhibition/views/view-exhibit.client.view.html'
            }).
            state('editExhibit', {
                url: '/exhibition/:exhibitId/edit',
                templateUrl: 'modules/exhibition/views/edit-exhibit.client.view.html'
            });
    }
]);

/**
 * Created by User on 2/3/2015.
 */
"use strict";

angular.module('exhibition').controller('RemoveExhibitionConfirmationController',
    ['$rootScope','$scope', '$modalInstance', 'exhibitName',
        function($rootScope, $scope, $modalInstance, exhibitName) {

    $scope.exhibitName = exhibitName;

    $scope.ok = function () {
            $modalInstance.close(true);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

/**
 * Created by User on 2/20/2015.
 */
/**
 * Created by User on 2/1/2015.
 */
'use strict';

angular.module('exhibition').controller('ExhibitController',
    ['$rootScope','$scope', '$filter', '$modal', '$document', '$timeout', '$stateParams', '$state','$http',
        '$window', 'Authentication', 'Exhibition', 'ExhibitMagnify','messaging', 'events','shotDelay',
        'deviceDetector',
        function($rootScope, $scope, $filter, $modal, $document, $timeout, $stateParams, $state, $http,
                 $window, Authentication, Exhibition, ExhibitMagnify, messaging, events, shotDelay,
                 deviceDetector) {


            $rootScope.urlRoot = $window.urlRoot;

            $scope.oddBrowser = function(){
                return deviceDetector.raw.browser.ie ||  deviceDetector.raw.browser.firefox;
            }

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
                if($scope.exhibit.pic.name)
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
                    messaging.publish(events.message._SERVER_REQUEST_STARTED_);
                };
            }

            if(document.getElementById('newPicture')) {
                document.getElementById('newPicture').onchange = function () {
                    document.getElementById('uploadNewFile').value = GetFilename(this.value);
                    messaging.publish(events.message._SERVER_REQUEST_STARTED_);
                };
            }

            $scope.$on('serverRequestEnded', function(){
                $scope.endUpload();
            });

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

        }
    ]);


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

            $rootScope.searchBar = ($state.current.name.toLowerCase() === 'exhibition') ? true : false;

            $rootScope.playerBar = $state.current.name.toLowerCase() === 'player' ? true : false;

            $rootScope.urlRoot = $window.urlRoot;

            $scope.timeoutDelay = false;

            $scope.imageWasNotInCache = false;

            $scope.oddBrowser = function(){
               return deviceDetector.raw.browser.ie ||  deviceDetector.raw.browser.firefox;
            }

            $rootScope.playerActive = false;

            $rootScope.slideIndex = 0;

            $rootScope.slidesLength = 0;

            $scope.authentication = Authentication;

            $scope.find = function() {
                $scope.exhibition = Exhibition.query();

                $scope.exhibition.$promise.then(function(data) {
                    $rootScope.slidesLength = $filter('picRequired')(data).length;
                    if($rootScope.playerBar) {
                        $scope.startPlay();
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

            $scope.$on(
                '$destroy',
                function( event ) {
                    removeTimers();
                }
            );
        }
    ]);

/**
 * Created by User on 2/11/2015.
 */
angular.module('common').filter('picRequired', function () {
    // function to invoke by Angular each time
    // Angular passes in the `items` which is our Array
    return function (items) {
        // Create a new Array
        var filtered = [];
        // loop through existing Array
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.pic.size) {
                filtered.push(item);
            }
        }
        // boom, return the Array after iteration's complete
        return filtered;
    };
});

/**
 * Created by User on 2/1/2015.
 */
'use strict';

//Exhibition service used for communicating with the exhibition REST endpoints
angular.module('exhibition').factory('Exhibition', ['$resource',
    function($resource) {
        return $resource('exhibition/:exhibitId', {
            exhibitId: '@_id'
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
                if (domImg.complete === false || domImg.naturalHeight === 0 || domImg.naturalWidth === 0) {
                    loadingCount++;
                } else {
                    var natHeight = domImg.naturalHeight;
                    var natWidth = domImg.naturalWidth;
                    var thumbHeight = natHeight / magnifyby;
                    var thumbWidth = natWidth / magnifyby;
                    var thumbdimensions = [thumbWidth, thumbHeight];

                    jQuery(this).imageMagnify(
                        {
                            vIndent: 50,
                            hIndent: 0,
                            magnifyby: magnifyby,
                            thumbdimensions: thumbdimensions
                        }
                    );
                }
            });

            if (loadingCount) {
                $timeout(function () {
                    runMagnify(elements, pollingInterval, magnifyby);
                }, pollingInterval);
            }
        }

        return {
            runMagnify: runMagnify
        }
    }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {

		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.href = function (href){
			$location.path(href);
		};

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

/**
 * Created by User on 2/18/2015.
 */
angular.module('imageupload', ['common'])
    .directive('image', ["$q", "messaging", "events", function($q, messaging, events) {
        'use strict'

        var URL = window.URL || window.webkitURL;

        var getResizeArea = function () {
            var resizeAreaId = 'fileupload-resize-area';

            var resizeArea = document.getElementById(resizeAreaId);

            if (!resizeArea) {
                resizeArea = document.createElement('canvas');
                resizeArea.id = resizeAreaId;
                resizeArea.style.visibility = 'hidden';
                document.body.appendChild(resizeArea);
            }

            return resizeArea;
        }

        var resizeImage = function (origImage, options) {
            var maxHeight = options.resizeMaxHeight || 300;
            var maxWidth = options.resizeMaxWidth || 250;
            var quality = options.resizeQuality || 0.7;
            var type = options.resizeType || 'image/jpg';

            var canvas = getResizeArea();

            var height = origImage.height;
            var width = origImage.width;

            // calculate the width and height, constraining the proportions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height *= maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width *= maxHeight / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            //draw image on canvas
            var ctx = canvas.getContext("2d");
            ctx.drawImage(origImage, 0, 0, width, height);

            // get the data from canvas as 70% jpg (or specified type).
            return canvas.toDataURL(type, quality);
        };

        var createImage = function(url, callback) {
            var image = new Image();
            image.onload = function() {
                callback(image);
            };
            image.src = url;
        };

        var fileToDataURL = function (file) {
            var deferred = $q.defer();
            var reader = new FileReader();
            reader.onload = function (e) {
                deferred.resolve(e.target.result);
            };
            reader.readAsDataURL(file);
            return deferred.promise;
        };


        return {
            restrict: 'A',
            scope: {
                image: '=',
                //endUploadCallBack: '&endUploadFn',
                resizeMaxHeight: '@?',
                resizeMaxWidth: '@?',
                resizeQuality: '@?',
                resizeType: '@?'
            },
            link: function postLink(scope, element, attrs, ctrl) {

                var doResizing = function(imageResult, callback) {
                    createImage(imageResult.url, function(image) {
                        var dataURL = resizeImage(image, scope);
                        imageResult.resized = {
                            dataURL: dataURL,
                            type: dataURL.match(/:(.+\/.+);/)[1]
                        };
                        callback(imageResult);
                    });
                };

                var applyScope = function(imageResult) {
                    scope.$apply(function() {
                        //console.log(imageResult);
                        messaging.publish(events.message._SERVER_REQUEST_ENDED_);
                        if(attrs.multiple)
                            scope.image.push(imageResult);
                        else
                            scope.image = imageResult;

                    });
                };


                element.bind('change', function (evt) {
                    //when multiple always return an array of images
                    if(attrs.multiple)
                        scope.image = [];

                    var files = evt.target.files;
                    for(var i = 0; i < files.length; i++) {
                        //create a result object for each file in files
                        var imageResult = {
                            file: files[i],
                            url: URL.createObjectURL(files[i])
                        };

                        fileToDataURL(files[i]).then(function (dataURL) {
                            imageResult.dataURL = dataURL;
                        });

                        if(scope.resizeMaxHeight || scope.resizeMaxWidth) { //resize image
                            doResizing(imageResult, function(imageResult) {
                                applyScope(imageResult);
                            });
                        }
                        else { //no resizing
                            applyScope(imageResult);
                        }
                    }
                });
            }
        };
    }]);


/* jQuery Image Magnify script v1.1
 * This notice must stay intact for usage
 * Author: Dynamic Drive at http://www.dynamicdrive.com/
 * Visit http://www.dynamicdrive.com/ for full source code

 * Nov 16th, 09 (v1.1): Adds ability to dynamically apply/reapply magnify effect to an image, plus magnify to a specific width in pixels.
 * Feb 8th, 11 (v1.11): Fixed bug that caused script to not work in newever versions of jQuery (ie: v1.4.4)
 */

'use strict';


jQuery.noConflict();

jQuery.imageMagnify={
	dsettings: {
		windowFit: true,
		vIndent: 0,
		hIndent: 0,
		heightPad: 0,
		widthPad: 0,
		magnifyby: 3, //default increase factor of enlarged image
		duration: 500, //default duration of animation, in millisec
		imgopacity: 0.2 //opacify of original image when enlarged image overlays it
	},
	cursorcss: 'url(/modules/common/js/magnify/magnify.cur), -moz-zoom-in', //Value for CSS's 'cursor' attribute, added to original image
	zIndexcounter: 100,

		refreshoffsets:function($window, $target, warpshell){
		var $offsets=$target.offset();
		var winattrs={x:$window.scrollLeft(), y:$window.scrollTop(), w:$window.width(), h:$window.height()};
		warpshell.attrs.x=$offsets.left; //update x position of original image relative to page
		warpshell.attrs.y=$offsets.top;
		warpshell.newattrs.x=winattrs.x+winattrs.w/2-warpshell.newattrs.w/2;
		warpshell.newattrs.y=winattrs.y+winattrs.h/2-warpshell.newattrs.h/2;
		if (warpshell.newattrs.x<winattrs.x+5){ //no space to the left?
			warpshell.newattrs.x=winattrs.x+5;
		}
		else if (warpshell.newattrs.x+warpshell.newattrs.w > winattrs.x+winattrs.w){//no space to the right?
			warpshell.newattrs.x=winattrs.x+5;
		}
		if (warpshell.newattrs.y<winattrs.y+5){ //no space at the top?
			warpshell.newattrs.y=winattrs.y+5;
		}
	},

	refreshSize: function($window, $target, imageinfo, setting){

		var element = $target.get(0);
		var natHeight = element.naturalHeight;
		var natWidth = element.naturalWidth;

		if(natHeight >= natWidth)
		{
			imageinfo.newattrs.h = (natHeight < $window.height() - setting.vIndent) ? natHeight : $window.height() - setting.vIndent;
			imageinfo.newattrs.w =  imageinfo.newattrs.h * natWidth / natHeight;
			if(imageinfo.newattrs.w >   $window.width()){
				imageinfo.newattrs.w = (imageinfo.newattrs.w < $window.width() - setting.hIndent) ? imageinfo.newattrs.w :  $window.width() - setting.hIndent;
				imageinfo.newattrs.h =  imageinfo.newattrs.w * natHeight / natWidth;
			}
		}
		else{
			imageinfo.newattrs.w =  (natWidth < $window.width() - setting.hIndent) ? natWidth :  $window.width() - setting.hIndent;
			imageinfo.newattrs.h =  imageinfo.newattrs.w * natHeight / natWidth;

			if(imageinfo.newattrs.h >   $window.height() - setting.vIndent){
				imageinfo.newattrs.h = (imageinfo.newattrs.h < $window.height() - setting.vIndent) ? imageinfo.newattrs.h : $window.height() - setting.vIndent;
				imageinfo.newattrs.w =  imageinfo.newattrs.h * natWidth / natHeight;
			}
		}

	},

	magnify:function($, $target, options){
		var setting={}; //create blank object to store combined settings
		var setting=jQuery.extend(setting, this.dsettings, options);
		var attrs=(options.thumbdimensions)? {w:options.thumbdimensions[0], h:options.thumbdimensions[1]} : {w:$target.outerWidth(), h:$target.outerHeight()};
		var newattrs={};

		//newattrs.w= (setting.magnifyto)? setting.magnifyto : Math.round(attrs.w*setting.magnifyby)
		//newattrs.h=(setting.magnifyto)? Math.round(attrs.h*newattrs.w/attrs.w) : Math.round(attrs.h*setting.magnifyby)

		//$target.css('cursor', jQuery.imageMagnify.cursorcss)
		if ($target.data('imgshell')){
			$target.data('imgshell').$clone.remove();
			$target.css({opacity:1}).unbind('click.magnify');
		}
		var $clone=$target.clone().css({position:'absolute', left:0, top:0, display:'none', border:'1px solid gray', cursor:'pointer'}).appendTo(document.body);
		$clone.data('$relatedtarget', $target); //save $target image this enlarged image is associated with
		$clone.data('$zoomOutProgress', '0');
		$clone.data('$zoomStatus', '0');
		$target.data('imgshell', {$clone:$clone, attrs:attrs, newattrs:newattrs});
		$target.bind('click.magnify', function(e){ //action when original image is clicked on
			var $this=$(this).css({opacity:setting.imgopacity});
			var imageinfo=$this.data('imgshell');
			if(!imageinfo) return;
			jQuery.imageMagnify.refreshSize($(window), $this, imageinfo, setting);
			jQuery.imageMagnify.refreshoffsets($(window), $this, imageinfo); //refresh offset positions of original and warped images
			var $clone=imageinfo.$clone;
			$clone.data('$zoomStatus', '0');
			$('body').on('click',  function(e){
				var  var1 = $clone.css('opacity');
				if(	e.target !== $clone.get(0)
					//&& $clone.css('opacity') == 1
					&& $clone.data('$zoomStatus') == '1'
					&& $clone.data('$zoomOutProgress') == '0') {

					$clone.trigger('click');
				}
			});

			$(window).on('click scroll resize',  function(e){
				var  var1 = $clone.css('opacity');
				if(	e.target !== $clone.get(0)
						//&& $clone.css('opacity') == 1
					&& $clone.data('$zoomStatus') == '1'
					&& $clone.data('$zoomOutProgress') == '0') {

					$clone.trigger('click');
				}
			});

			$clone.stop().css({zIndex:++jQuery.imageMagnify.zIndexcounter, left:imageinfo.attrs.x, top:imageinfo.attrs.y, width:imageinfo.attrs.w, height:imageinfo.attrs.h, opacity:0, display:'block'})
				.animate({opacity:1, left: ($(window).width() === imageinfo.newattrs.w ? 0 : imageinfo.newattrs.x + setting.hIndent), top: imageinfo.newattrs.y + setting.vIndent, width:imageinfo.newattrs.w + setting.widthPad, height:imageinfo.newattrs.h + setting.heightPad}, setting.duration,
				//.animate({opacity:1, left: 0, top: '0', height: '100%', width: '100%'}, setting.duration,
				function(){ //callback function after warping is complete
					$clone.data('$zoomStatus', '1');
					//none added
				}); //end animate
			}); //end click
		$clone.on('click', function(e){
				var $=jQuery;
				var $this=$(this);
				var imageinfo=$this.data('$relatedtarget').data('imgshell');
				if(!imageinfo) return;
				$this.data('$zoomOutProgress', '1');
				jQuery.imageMagnify.refreshSize($(window), $this, imageinfo, setting);
				jQuery.imageMagnify.refreshoffsets($(window), $this.data('$relatedtarget'), imageinfo); //refresh offset positions of original and warped images

				$this.stop().animate({opacity:0, left:imageinfo.attrs.x, top:imageinfo.attrs.y + setting.vIndent, width:imageinfo.attrs.w, height:imageinfo.attrs.h},  setting.duration,
					function(){
						$this.hide();
						$this.data('$relatedtarget').css({opacity:1}); //reveal original image
						$this.data('$zoomOutProgress', '0');
						$clone.data('$zoomStatus', '0');
					}); //end animate
			}
		);
	}
};

jQuery.fn.imageMagnify=function(options){
	var $=jQuery;
	return this.each(function(){ //return jQuery obj
		var $imgref=$(this);
		if (this.tagName && this.tagName.toUpperCase()!='IMG')
			return true; //skip to next matched element
		if (parseInt($imgref.css('width'))>0 && parseInt($imgref.css('height'))>0 || options.windowFit || options.thumbdimensions ){ //if image has explicit width/height attrs defined
			jQuery.imageMagnify.magnify($, $imgref, options);
		}
		else if (this.complete){ //account for IE not firing image.onload
			jQuery.imageMagnify.magnify($, $imgref, options);
		}
		else{
			$(this).bind('load', function(){
				jQuery.imageMagnify.magnify($, $imgref, options);
			})
		}
	});
};

jQuery.fn.applyMagnifier=function(options){ //dynamic version of imageMagnify() to apply magnify effect to an image dynamically
	var $=jQuery;
	return this.each(function(){ //return jQuery obj
		var $imgref=$(this);
		if (this.tagName && this.tagName.toUpperCase()!="IMG")
			return true; //skip to next matched element
	});
};


//** The following applies the magnify effect to images with class="magnify" and optional "data-magnifyby" and "data-magnifyduration" attrs
//** It also looks for links with attr rel="magnify[targetimageid]" and makes them togglers for that image

jQuery(document).ready(function($){
	var $targets=$('.magnify');
	$targets.each(function(i){
		var $target=$(this);
		var options={};
		if ($target.attr('data-magnifyto'))
			options.magnifyto=parseFloat($target.attr('data-magnifyto'));
		if ($target.attr('data-magnifyby'))
			options.magnifyby=parseFloat($target.attr('data-magnifyby'));
		if ($target.attr('data-magnifyduration'))
			options.duration=parseInt($target.attr('data-magnifyduration'));
		$target.imageMagnify(options);
	});
	var $triggers=$('a[rel^="magnify["]');
	$triggers.each(function(i){
		var $trigger=$(this);
		var targetid=$trigger.attr('rel').match(/\[.+\]/)[0].replace(/[\[\]']/g, ''); //parse 'id' from rel='magnify[id]'
		$trigger.data('magnifyimageid', targetid);
		$trigger.click(function(e){
			$('#'+$(this).data('magnifyimageid')).trigger('click.magnify');
			e.preventDefault();
		});
	});
});

