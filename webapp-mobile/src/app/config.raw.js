
angular.module('configService', [])

.factory('configService', ['$rootScope', '$window', function () {
    return {
        debug: true,
        hubiquitusProtocol: 'http://',
        hubiquitusHost: '@@hubiquitusServer',
        hubiquitusPort: 80,
        hubiquitusPath: '/hubiquitus',
        geolocHighAccuracy: true,
        geolocTimeout: 30000,
        geolocMaxAge: 30000
    };
}]);