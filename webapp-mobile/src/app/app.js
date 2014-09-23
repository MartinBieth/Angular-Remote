angular.module( 'webappMobileApp', [
  'templates-app',
  'templates-common',
  'webappMobileApp.home',
  'webappMobileApp.control',
  'ui.router',
  'hubiquitusManager'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | webappMobileApp' ;
    }
  });
})

;

