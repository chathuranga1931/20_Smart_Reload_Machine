/**
 * modified from http://cutroni.com/blog/2014/02/12/advanced-content-tracking-with-universal-analytics/
 */
 
(function($) {
    var ReaderTracker = function(debugMode) {        
        this.debugMode = !!debugMode;
        
        // Default time delay before checking location
        this.callBackTime = 100;

        // Set some flags for tracking & execution
        this.timer = 0;
        
        // content ids we want to track
        this.monitoredIds = [];
        this.monitoredElementsMap = {};
        this.monitoredDoneMap = {};
        this.titleMap = {};

        // Get some information about the current page
        this.pageTitle = document.title;
        this.pageUrl = window.location.href;
                
        // track scroll
        this.bindScroll();
    }
    
    ReaderTracker.prototype = {
        constructor: ReaderTracker,
        
        bindScroll: function() {
            // Track the scrolling and track location
            var self = this;
            $(window).scroll(function() {
                if (self.timer) {
                    clearTimeout(self.timer);
                }
                // Use a buffer so we don't call trackLocation too often.
                self.timer = setTimeout($.proxy(self.trackLocation, self), self.callBackTime);
            });            
        },
        
        track: function(contentId, title) {
            var monitoredElement = $('#'+contentId);
            if (monitoredElement.length) {
                this.monitoredIds.push(contentId);
                this.monitoredElementsMap[contentId] = monitoredElement;
                this.monitoredDoneMap[contentId] = false;
                this.titleMap[contentId] = title;
            }
            return this;  
        },
        
        trackLocation: function() {
            // Check the location and track user
            var bottom = $(window).height() + $(window).scrollTop();

            // If user has hit the bottom of any watched content send an event
            for (var i=0; i < this.monitoredIds.length; i++) {
                var monitoredId = this.monitoredIds[i];
                if (!this.monitoredDoneMap[monitoredId]) {
                    var monitoredElement = this.monitoredElementsMap[monitoredId];
                    var monitoredElementHeight = monitoredElement.height();
                    var monitoredElementContentBottomOffset = monitoredElementHeight + monitoredElement.offset().top;
                    var title = this.titleMap[monitoredId];
                    if (bottom >= monitoredElementContentBottomOffset) {
                        if (!this.debugMode) {
                            dataLayer.push({
                                'event': 'GAEvent',
                                'GAEventCategory': 'Reading',
                                'GAEventAction': title,
                                'GAEventLabel': undefined,
                                'GAEventValue': undefined,
                                'GAEventNonInteraction': true
                            });
                        } else {
                            alert('[_trackEvent, "Reading", "'+title+'"]');
                        }
                        this.monitoredDoneMap[monitoredId] = true;
                    }
                }          
            }
        }       
    }    
    
    window.ReaderTracker = ReaderTracker;  
})(jQuery);