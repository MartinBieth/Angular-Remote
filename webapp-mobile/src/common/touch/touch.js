

angular.module('touchManager', [])

.factory('touchManager', ['$rootScope', '$window', function ($rootScope, $window) {

    var fireEventTime = 150;
    var prevCoordinates = [];
    var timeout = null;

    function fireEvent () {
        // clears the timeout variable
        timeout = null;

        // computes the distance
        var distance = 0;
        for (var i = 0; i < prevCoordinates.length -1; i++) {
            var x1, y1, x2, y2;
            x1 = prevCoordinates[i].x;
            y1 = prevCoordinates[i].y;
            x2 = prevCoordinates[i+1].x;
            y2 = prevCoordinates[i+1].y;
            distance += Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
        }

        var dx = prevCoordinates[0].x - prevCoordinates[prevCoordinates.length -1].x;
        var dy = prevCoordinates[0].y - prevCoordinates[prevCoordinates.length -1].y;
        var direction = '';
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) { direction = 'l'; }
            else { direction = 'r'; }
        }
        else {
            if (dy > 0) { direction = 'u'; }
            else { direction = 'd'; }
        }
        var speed = 0;
        if (Math.abs(dx) > Math.abs(dy)) {
            speed = 100*(Math.abs(dx)/$window.innerWidth);
        }
        else {
            speed = 100*(Math.abs(dy)/$window.innerHeight);
        }

        if (speed > 0) {
            $rootScope.$broadcast('mtl:touchmove', {dis: distance, dir: direction, spd: speed});
        }

        // resets the coordinates
        prevCoordinates = [];
    }

    function touchMoveHandler(e) {
        prevCoordinates.push({x: e.clientX, y: e.clientY});
        if (!timeout) {
            timeout = setTimeout(fireEvent, fireEventTime);
        }
    }

    return {
        init : function () {
            // windows phone 8
            if ($window.navigator.msPointerEnabled) {
                document.addEventListener('pointermove', function(e) {
                    touchMoveHandler(e);
                });
            }
            // others
            else {
                document.addEventListener('touchmove', function(e) {
                    e.preventDefault();
                    touchMoveHandler(e.targetTouches[0]);
                });
            }
        }
    };

}]);