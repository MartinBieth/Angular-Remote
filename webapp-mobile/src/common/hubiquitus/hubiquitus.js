angular.module('hubiquitusManager', [])

.factory('hubiquitusManager', ['$rootScope', '$window', function ($rootScope, $window) {
    var Hubiquitus = $window.hubiquitus.Hubiquitus;
    var logger;

    $rootScope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    var hClient = null;
    var isConnected = false;
    var onConnectCallback,
        onDisconnectCallback,
        onReconnectCallback,
        onMessageCallback;

    function init() {
        hClient = new Hubiquitus({autoReconnect: true});
        Hubiquitus.logger.enable('hubiquitus','trace');
        Hubiquitus.logger.enable('koq','trace');
        logger = Hubiquitus.logger('koq');
        hClient.on('message', onMessage);
        hClient.on('connect', onConnect);
        hClient.on('reconnect', onReconnect);
        hClient.on('disconnect', onDisconnect);
    }

    function onConnect() {
        isConnected = true;
        logger.debug('connected');
        $rootScope.$broadcast('hubiquitus:connect');
        if (typeof onConnectCallback === 'function') {
            $rootScope.safeApply(onConnectCallback);
        }
    }
    function onReconnect() {
        isConnected = true;
        logger.debug('reconnected');
        $rootScope.$broadcast('hubiquitus:reconnect');
        if (typeof onConnectCallback === 'function') {
            $rootScope.safeApply(onReconnectCallback);
        }
    }
    function onDisconnect() {
        isConnected = false;
        logger.debug('disconnected');
        $rootScope.$broadcast('hubiquitus:disconnect');
        if (typeof onDisconnectCallback === 'function') {
            $rootScope.safeApply(onDisconnectCallback);
        }
    }

    function onMessage(req) {
        logger.debug('onMessage: ', req);
        $rootScope.$broadcast('hubiquitus:message', req);
        if (typeof onMessageCallback === 'function') {
            $rootScope.safeApply(function() { onMessageCallback(req); });
        }
    }

    return {
        isConnected: function () {
            return isConnected;
        },
        connect: function (data, endpoint) {
            if (!hClient) {
                init();
            }
            hClient.connect(endpoint, data);
        },
        subscribe: function (actor, callback) {
            hClient.subscribe(actor, function (hMessage) {
                $rootScope.safeApply(function () {
                    callback(hMessage.payload);
                });
            });
        },
        send: function(actor, content, timeout, cb, headers) {
            hClient.send(actor, content, timeout, cb, headers);
        },
        disconnect: function () {
            hClient.disconnect();
        },
        onConnect: function (callback) {
            onConnectCallback = callback;
        },
        onReconnect: function (callback) {
            onReconnectCallback = callback;
        },
        onDisconnect: function (callback) {
            onDisconnectCallback = callback;
        },
        onMessage: function (callback) {
            onMessageCallback = callback;
        }
    };

}]);