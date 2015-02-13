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
			$rootScope.playerActive = value;
			var action = value ? 'startPlayer' : 'stopPlayer';
			$rootScope.$broadcast(action);
		}

		$rootScope.$on('pressStopButton', function(){
			$rootScope.playerActive = false;
		});

	}
]);
