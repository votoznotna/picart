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
	}
]);
