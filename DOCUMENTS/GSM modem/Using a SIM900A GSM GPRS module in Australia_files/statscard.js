(function($, _) {
        
    var StatsCard = function(el, options) {
        this.init(el, options);
    }

    StatsCard.prototype = {
        constructor: StatsCard,        
        
        init: function(el, options) {
            this.$element = $(el);
            this.screenName = this.$element.data('screenname') ? this.$element.data('screenname') : this.$element.text();
            this.loginURL = options.loginURL;
            this.author = null;
            this.intentTimeout = null;
            this.options = $.extend({
                placement: 'right',
                trigger: 'manual',
                html: true
            });
            this.createPopover({content: 'Loading...'});
            Ibles.fetchTemplate("/static/templates/statscard.html");
        },
        
        createPopover: function(options) {
            this.$element.popover($.extend({}, this.options, options)).hover($.proxy(this.mouseInTrigger, this), $.proxy(this.mouseOut, this));
        },
        
        getPopover: function() {
            return this.$element.data('popover');
        },
        
        getPopoverContainer: function() {
            return this.$element.data('popover').tip();
        },
        
        showPopover: function() {
            this.getPopover().show();
        },
        
        fetchAuthor: function(callback) {
            if (!this.contentRequested) {
                var apiParams = {
                    lite: "true",
                    screenName: this.screenName
                };
                $.get("/json-api/showAuthor?"+$.param(apiParams), function(data) {
                    callback(data);
                });
                this.contentRequested = true;
            }
        },
        
        getStatscardContent: function() {                    
            if (!this.signupDateFormated) {
                this.author.signup = moment(this.author.signup.split(" ")[0]).format('MMM Do YYYY');
                this.signupDateFormated = true;
            }
            if (!this.countsFormatted) {
                var viewCount = this.author.views,
                    favoritesCount = this.author.favoritesCount;
                this.author.views = numeral(viewCount).format('0,0');
                this.author.favoritesCount = numeral(favoritesCount).format('0,0');
                this.countsFormatted = true;
            }
            return Ibles.templateCache('#statscard-template')({data: this.author});            
        },
                
        mouseInTrigger: function(e) {
            var that = this;
            this.hovering = true;
            this.intentTimeout = setTimeout(function(){
                if (that.hovering){
                    that.getPopover().show();
                    that.fetchAuthor(function(data) {
                        that.author = data;
                        that.author.following = (typeof data.following !== "undefined") && data.following;
                        that.getPopover().destroy();
                        that.createPopover({
                            content: $.proxy(that.getStatscardContent, that),
                            template: Ibles.templateCache('#statscard-wrapper-template')()
                        });
                        that.showPopover();
                        that.getPopoverContainer().hover($.proxy(that.mouseInPopover, that), $.proxy(that.mouseOut, that));
                        that.enableFollowing();
                    });
                }
            }, 250);
        },
        
        mouseInPopover: function(e) {
            this.hovering = true;
        },
                
        mouseOut: function(e) {
            this.hovering = false;
            var that = this;
            clearTimeout(this.intentTimeout);
            clearTimeout(this.persistenceTimeout);
            this.persistenceTimeout = setTimeout(function() {
                if (!that.hovering) {
                    that.$element.popover("hide");
                }
            }, 500);
        },
        
        enableFollowing: function() {
            var that = this;                
            this.getPopoverContainer().on("click", ".follow-btn", function(e){
                var followBtn = $(e.currentTarget);
                followBtn.addClass('disabled');
                followBtn.children('span').html('Loading...');  
                $.ajax({
                    url: "/json-api/" + (that.author.following ? "unfollowAuthor" : "followAuthor"),
                    dataType: 'json',
                    type: 'POST',
                    data: {'screenName': that.screenName}
                }).done(function(data) {
                    var isFollowing = data.isFollowing;
                    that.author.following = isFollowing;
                    if (isFollowing) {
                        that.author.followersCount++
                    } else {
                        that.author.followersCount--;
                    }
                }).fail(function(jqXHR, textStatus) {
                    if (jqXHR.status === 401)
                        window.location.href = that.loginURL;
                }).complete(function(){
                    followBtn.removeClass('disabled');
                    followBtn.fadeOut(400, function(){
                        followBtn.children('span').html(that.author.following ? followBtn.data("followingtxt") : followBtn.data("followtxt"));
                        followBtn.children('.bg-icon').removeClass('checkmarksmall plus').addClass(that.author.following ? 'checkmarksmall' : 'plus');
                        followBtn.fadeIn(400);
                    });
                    var countContainer = followBtn.closest(".follow").find(".callout"),
                        followCount = that.author.followersCount;                        
                    countContainer.text(followCount);
                })
            });
        }
    }

    $.fn.statscard = function(option) {
        return this.each(function() {   
            var $this = $(this),
                data = $this.data('statscard'),
                options = typeof option == 'object' && option;
            if (!data) $this.data('statscard', (data = new StatsCard(this, options)));
        })
    }

    $.fn.statscard.Constructor = StatsCard
})(window.jQuery, window._);


// inialize statscard
(function($){
    $(function(){
       $('.memberstats').statscard({loginURL: "/account/login?{0}".format(window.Ibles.pageContext.continueParams)});   
    });  
})(jQuery);