"use strict";

var _ = require("lodash");

var Workers = function( app ) {
	var self = this;
    self.me = "workers";
    self.workers = [];
    self.app = app;

	var startWorker = function (worker) {
		if(_.isFunction(worker.start)) {
			
			worker.start();
			self.workers.push(worker);
		} else {
			logger.crit("%s: %s cannot start", self.me, worker.me);
		}
	};

    self.start = function () {
        var Reboji = require("../bots/reboji");
        var bot = new Reboji( self.app );
        console.log ( 'start', bot)

        startWorker(bot);        
    };

    self.closeGracefully = function (signal) {
        var graceTimeout = 100;
        process.exit();
        logger.notice("%s: received signal (%s) on %s, shutting down gracefully in %s ms'", self.me,
            signal,
            new Date().toString('T'),
            graceTimeout
        );
        setTimeout(function() {
            logger.notice('(x) forcefully shutting down',graceTimeout);
            process.exit();
        }, graceTimeout);

        self.workers.forEach(function (element, index, array) {
            if (typeof element.closeGracefully == 'function') {
                element.closeGracefully();
            }
        });
    };
};
module.exports = Workers;