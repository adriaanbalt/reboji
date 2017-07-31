"use strict";

var _ = require("lodash");

var Workers = function() {
    console.log ( "Workers init ")
	var srv = require ("./config");
	var logger = srv.logger;
	var self = this;
    self.me = "workers";
    self.workers = [];

	var startWorker = function (worker) {
		if(_.isFunction(worker.start)) {
			
			worker.start();
			self.workers.push(worker);
		} else {
			logger.crit("%s: %s cannot start", self.me, worker.me);
		}
	};

    self.start = function ( socket ) {
        startWorker( reboji );        
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