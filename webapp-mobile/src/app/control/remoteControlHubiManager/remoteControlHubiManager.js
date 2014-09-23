
angular.module('remoteControlHubiManager', [
    'configService'
])

.factory('remoteControlHubiManager',
    ['$timeout', '$routeParams', 'configService', '$rootScope', '$window', 'hubiquitusManager',
    function ($timeout, $routeParams, conf, $rootScope, $window, hubiquitusManager) {

    // connects the Hubiquitus client
    hubiquitusManager.connect({kind: 'MOB', token: null}, conf.hubiquitusProtocol+conf.hubiquitusHost+':'+conf.hubiquitusPort+conf.hubiquitusPath);
    // gets the position in queue
    hubiquitusManager.send('RCM:'+$routeParams.storeid+'#queue');

    var lastAction = null;
    var queuePosition = null;
    var isConnected = hubiquitusManager.isConnected();
    var screenOffline = false;
    var idleKicked = false;
    var receivedUrl = null;
    var timeoutLastAction = null;
    var view = 'SLIDESHOW';

    // hubiquitus event hooks
    // on connect
    hubiquitusManager.onConnect(function() {
        // gets the position in queue
        hubiquitusManager.send('RCM:'+$routeParams.storeid+'#queue');

        isConnected = true;
        lastAction = null;

        // broadcasts an event
        $rootScope.$broadcast('remote::connect');
    });
    // on reconnect
    hubiquitusManager.onReconnect(function() {
        isConnected = true;
        lastAction = null;

        // gets the position in queue
        hubiquitusManager.send('RCM:'+$routeParams.storeid+'#queue');

        // broadcasts an event
        $rootScope.$broadcast('remote::reconnect');
    });
    // on disconnect
    hubiquitusManager.onDisconnect(function() {
        isConnected = false;
        // broadcasts an event
        $rootScope.$broadcast('remote::disconnect');
    });
    // on message
    hubiquitusManager.onMessage(function(req) {
        // broadcasts an event
        $rootScope.$broadcast('remote::message', req);

        // queue position updates
        if (req && req.content && req.content.type && req.content.type === 'newQueuePosition') {
            queuePosition = req.content.position;
        }

        // screen statuses
        if (req && req.content && req.content.type && req.content.type === 'screenStatus') {
            if (req.content.content === 'SCREEN_OFFLINE') {
                screenOffline = true;
                hubiquitusManager.disconnect();
            }
            if (req.content.content === 'KICKED_TIMEOUT') {
                idleKicked = true;
                hubiquitusManager.disconnect();
            }
        }

        // product url informations
        if (req && req.content && req.content.type && req.content.type === 'screenStatus') {
            switch(req.content.content){
                case 'SLIDESHOW_VIEW':
                    receivedUrl = null;
                    view = 'SLIDESHOW';
                    break;
                case 'DETAILED_VIEW':
                    receivedUrl = req.content.url;
                    view = 'DETAILED';
                    break;
                case 'SPECIAL_VIEW':
                    receivedUrl = null;
                    view = 'SPECIAL';
                    break;
                default:
                    break;
            }
        }
    });

    return {
        lastAction: function() { return lastAction; },
        queuePosition: function() { return queuePosition; },
        isConnected: function() { return isConnected; },
        screenOffline: function() { return screenOffline; },
        idleKicked: function() { return idleKicked; },
        send: function(action, cb, bypassRecentAction) {

            // limits to one remote action per 500ms
            if (this.recentAction && !bypassRecentAction) {
                return;
            }
            else {
                this.recentAction = true;
                var _this = this;
                $timeout(function() { _this.recentAction = false; }, 500);
            }
            // debug log if debug mode is on
            if(conf.debug) {
                console.log('remote::send action=', action);
            }

            //If the product have an url and the user tap,load the url
            if(receivedUrl && action.event === 'tap') {
                $window.location.href = receivedUrl;
            }

            // sends an hubiquitus message
            hubiquitusManager.send('RCM:'+$routeParams.storeid+'#screen', action, null, cb);
            lastAction = action;

            // hides the last action after a while
            $timeout.cancel(timeoutLastAction);
            timeoutLastAction = $timeout(function() {
                lastAction = 'timeout';
            }, 1000);
        },
        receivedUrl: function() { return receivedUrl; }
    };
}]);