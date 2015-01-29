'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'picart';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils', 'blockUI', 'grecaptcha'];

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
			$locationProvider.hashPrefix('!');
		}
	])
	.config(["blockUIConfig", function(blockUIConfig) {
		//blockUIConfig.templateUrl = 'block-ui-overlay.html';
		//blockUIConfig.template = '<div class="progress"></div>';
		// Change the default overlay message
		//blockUIConfig.message = '';

	}])
	.config(["grecaptchaProvider", function(grecaptchaProvider) {
		grecaptchaProvider.setParameters({
			sitekey : window.recaptchaSiteKey,
			theme: 'light'
		})
	}])
	.run(["$templateCache", function($templateCache) {
		$templateCache.put('block-ui-overlay.html', '<div class="progress"></div>');
	}]);


//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles');
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
 * Created by User on 1/19/2015.
 */
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('galleries',['common', 'imageupload']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Articles', 'articles', 'dropdown', '/articles(/create)?', true);
		//Menus.addSubMenuItem('topbar', 'articles', 'List Articles', 'articles', null, true);
		//Menus.addSubMenuItem('topbar', 'articles', 'Post Article', 'articles/create', null, false);
	}
]);

'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('listArticles', {
			url: '/articles',
			templateUrl: 'modules/articles/views/list-articles.client.view.html'
		}).
		state('createArticle', {
			url: '/articles/create',
			templateUrl: 'modules/articles/views/create-article.client.view.html'
		}).
		state('viewArticle', {
			url: '/articles/:articleId',
			templateUrl: 'modules/articles/views/view-article.client.view.html'
		}).
		state('editArticle', {
			url: '/articles/:articleId/edit',
			templateUrl: 'modules/articles/views/edit-article.client.view.html'
		});
	}
]);
'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles',
	function($scope, $stateParams, $location, Authentication, Articles) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var article = new Articles({
				title: this.title,
				content: this.content
			});
			article.$save(function(response) {
				$location.path('articles/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.articles) {
					if ($scope.articles[i] === article) {
						$scope.articles.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('articles');
				});
			}
		};

		$scope.update = function() {
			var article = $scope.article;

			article.$update(function() {
				$location.path('articles/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.articles = Articles.query();
		};

		$scope.findOne = function() {
			$scope.article = Articles.get({
				articleId: $stateParams.articleId
			});
		};
	}
]);
'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', ['$resource',
	function($resource) {
		return $resource('articles/:articleId', {
			articleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
/**
 * Created by User on 1/24/2015.
 */
angular.module('common').directive('fileRequired',function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link:function(scope, el, attrs, ngModel){
            el.bind('change',function(){
                scope.$apply(function(){
                    ngModel.$setViewValue(el.val());
                    ngModel.$render();
                });
            });
        }
    }
});

/**
 * Created by User on 1/22/2015.
 */

angular.module('common').directive('showErrors', ["$timeout", function ($timeout) {

    return {
        restrict: 'A',
        require: '^form',
        link: function (scope, el, attrs, formCtrl) {

            // find the text box element, which has the 'name' attribute
            var inputEl = el[0].querySelector("[name]");

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
    }

}]);

/**
 * Created by User on 1/24/2015.
 */
angular.module('common').directive('uniqueName', ["mongolab", function(mongolab) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {

            var mongoDbCollection = attrs["mongoCollection"];
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
                    mongolab.query(mongoDbName, mongoDbCollection, {q: {Name: viewValue}})
                        .then(getByNameSuccessHandler, getByNameErrorHandler);
                }

                return viewValue;
            });
        }
    };
}]);

/**
 * Created by User on 1/24/2015.
 */
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
        return $http({method: "GET", url: uri, params: parameters, cache: false});
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
        return $http({method: "POST", url: uri, data: angular.toJson(object), cache: false});
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
        return $http({method: "PUT", url: uri, data: angular.toJson(object), cache: false});
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
        return $http({method: "DELETE", url: uri, cache: false});
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

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
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
 * Created by User on 1/19/2015.
 */
'use strict';

// Configuring the Articles module
angular.module('galleries').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Galleries', 'galleries', null, null, true);
        Menus.addMenuItem('topbar', 'New Gallery', 'galleries/create', null, null, false);
        //Menus.addSubMenuItem('topbar', 'galleries', 'List of Galleries', 'galleries', null, true);
        //Menus.addSubMenuItem('topbar', 'galleries', 'New Gallery', 'galleries/create', null, false);
    }
]);

/**
 * Created by User on 1/19/2015.
 */
'use strict';

// Setting up route
angular.module('galleries').config(['$stateProvider',
    function($stateProvider) {
        // Galleries state routing
        $stateProvider.
            state('listGalleries', {
                url: '/galleries',
                templateUrl: 'modules/galleries/views/list-galleries.client.view.html'
            }).
            state('createGallery', {
                url: '/galleries/create',
                templateUrl: 'modules/galleries/views/create-gallery.client.view.html'
            }).
            state('viewGallery', {
                url: '/galleries/:galleryId',
                templateUrl: 'modules/galleries/views/view-gallery.client.view.html'
            }).
            state('editGallery', {
                url: '/galleries/:galleryId/edit',
                templateUrl: 'modules/galleries/views/edit-gallery.client.view.html'
            });
    }
]);

/**
 * Created by User on 1/19/2015.
 */

'use strict';

angular.module('galleries').controller('GalleriesController',
    ['$scope', '$stateParams', '$location','$http', '$window', 'Authentication', 'Galleries', 'blockUI',
    function($scope, $stateParams, $location, $http,  $window, Authentication, Galleries, blockUI) {

        $scope.master = {};

        $scope.recaptcha = null;

        $scope.gallery = angular.copy($scope.master);

        $scope.authentication = Authentication;

        $scope.create = function() {

            $scope.$broadcast('show-errors-event');

            if ($scope.galleryForm.$invalid)
                return;

            var formData = new FormData();
            formData.append('image', $scope.gallery.picture.file);
            formData.append('title', $scope.gallery.title);
            formData.append('content', $scope.gallery.content);
            formData.append('recaptcha', $scope.recaptcha);
            formData.append('g-recaptcha-response', angular.element(document.getElementById("g-recaptcha-response")).val());

            $http.post('upload', formData, {
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            }).success(function(result) {
                 $location.path('galleries');
                $scope.uploadedImgSrc = result.src;
                $scope.sizeInBytes = result.size;
            }).error(function(data, status, headers, config) {
                $scope.hasFormError = true;
                $scope.formErrors = status || data ? data.message : "Unknown error";
                //$scope.error = data.message;
            });


/*            var gallery = new Galleries({
                title: $scope.gallery.title,
                content: $scope.gallery.content
            });
            gallery.$save(function(response) {
                //$location.path('galleries/' + response._id);
                $location.path('galleries');

               // $window.history.back();
            }, function(errorResponse) {
                $scope.hasFormError = true;
                $scope.formErrors = errorResponse.statusText;
            });*/
        };


        $scope.remove = function(gallery) {
            if (gallery) {
                gallery.$remove();

                for (var i in $scope.galleries) {
                    if ($scope.galleries[i] === gallery) {
                        $scope.galleries.splice(i, 1);
                    }
                }
            } else {
                $scope.gallery.$remove(function() {
                    $location.path('galleries');
                });
            }
        };

        $scope.update = function() {

            $scope.$broadcast('show-errors-event');

            if ($scope.galleryForm.$invalid)
                return;

            var gallery = $scope.gallery;

            gallery.$update(function() {
                //$location.path('galleries/' + gallery._id);
                $location.path('galleries');

            }, function(errorResponse) {
                $scope.hasFormError = true;
                $scope.formErrors = errorResponse.statusText;
                //$scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function() {
            $scope.galleries = Galleries.query();
        };

        $scope.findOne = function() {
            $scope.gallery = Galleries.get({
                galleryId: $stateParams.galleryId
            });
        };

        $scope.cancelForm = function () {
           // $window.history.back();
            $location.path('galleries');
        };

        $scope.resetForm = function () {
            $scope.$broadcast('hide-errors-event');
            $scope.clearPicture();
            $scope.gallery = angular.copy($scope.master);
            $scope.hasFormError = false;
            $scope.formErrors = null;
            $scope.galleryForm.$setPristine();
            $scope.galleryForm.$setUntouched();
        };

        $scope.clearPicture = function() {
            $scope.gallery.picture  = null;
            angular.element(document.querySelector('#picture')).val("");
        };
    }
]);

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