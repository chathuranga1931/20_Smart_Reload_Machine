(function($){
    function initialize() {
        // Hacky: we don't really care about making this true to backbone form
        // since we are porting project pages over to django at some point
        CommentsInitializer =  Backbone.View.extend({
            initialize: function(options) {
                this.commentsContext = options.commentsContext;
                this.initCommentsLoggedOutView();
                if (options.loggedIn) {
                    this.initCommentsLoggedInView();
                }
            },
            
            initCommentsLoggedOutView: function() {
                $(".in-reply-to").click(function(e){
                    e.preventDefault();
                    $('html, body').animate({scrollTop : $("#comment-"+$(this).attr('href').substr(1)).offset().top-$('#ible-header').outerHeight()}, 'slow');
                });
                                
                $("div.comment-entry div.spotThumbs a").fancybox({
                    afterShow: function (x) {
                        var $el = $(this.element),
                            parseNotes = function(htmlEscapedNotesString) {
                                var htmlDecode = function(value){ 
                                    return $('<div/>').html(value).text(); 
                                };
                                return eval(htmlDecode(htmlEscapedNotesString));
                            },
                            notes = parseNotes($el.find("img").data("notes"));
                        if (!_.isEmpty(notes))
                            $("img.fancybox-image").notes(notes, false, $(".fancybox-inner"));
                    }
                });                  
            },
            
            initCommentsLoggedInView: function() {
                var controller,
                    commentsContext = this.commentsContext,
                    createController = function (el) {
                        return new CommentControl(el, commentsContext);
                    },
                    commentsContainer = $(".comments-container");

                Ibles.fetchAndAppendTemplate("/static/templates/comments.html", $('body'));

                commentsContainer.on("click", ".flag-comment", function (evt) {
                    evt.preventDefault();
                    if (typeof controller !== "undefined") controller.cancel();
                    controller = createController($(this));
                    controller.flag($(this).attr("data-commentid"));;
                });

                commentsContainer.on("click", ".add-comment-link", function (evt) {
                    evt.preventDefault();
                    if (typeof controller !== "undefined") controller.cancel();
                    controller = createController($(this));
                    controller.comment();
                });

                commentsContainer.on("click", ".reply-comment", function (evt) {
                    evt.preventDefault();
                    if (typeof controller !== "undefined") controller.cancel();
                    controller = createController($(this));
                    controller.reply($(this).data("postid"));
                });

                commentsContainer.on("click", "a.delete-comment", function (evt) {
                    evt.preventDefault();
                    controller = createController($(this));
                    controller.deleteComment($(this).attr("href"));
                });

                commentsContainer.on("click",".imadeit-check",function(evt) {
                    controller = createController($(this));
                    var that = this,
                    statusBar = $(this).next('.imadeit-status'),
                    value = $(this).is(':checked'),
                    callbacks = {
                    success:function(data){
                        statusBar.removeClass('loading').addClass('success').fadeTo(2000,0);
                    },                
                    error:function(data){
                        statusBar.removeClass('loading').addClass('error');
                        $(that).prop('checked',!value);
                    }};
                    statusBar.removeClass('success error').addClass('loading').css( "opacity", 1 );
                    controller.changeIMadeIt($(this).attr('name'),value,callbacks);
                });

                commentsContainer.on("click", "a.delete-comment-thread", function (evt) {
                    evt.preventDefault();
                    controller = createController($(this));
                    controller.deleteCommentThread($(this).attr("href"));
                });

                commentsContainer.on("click", "a.limbo", function (evt) {
                    evt.preventDefault();
                    var rawParams = $(this).attr("href").split("::");
                    var params = {
                        action: rawParams[0],
                        type: rawParams[1],
                        objectIds: rawParams[2]
                    };
                    var el = $(this);
                    $.ajax({
                        url: "/admin/quarantine",
                        data: params,
                        type: "POST",
                        dataType: "json",
                        success: function (response) {
                            ___loadFeedback(function(){feedBack.addFromJSON(response)});
                        }
                    });
                });

                // initial comment controllers
                var topInvoker = $('#comment-invoker-top'),
                    bottomInvoker = $('#comment-invoker-bottom');
                if (topInvoker.length)
                    createController(topInvoker).comment(true);
                if (bottomInvoker.length)
                    createController(bottomInvoker).comment(true);                    
            }
        });
        
        new CommentsInitializer({
            loggedIn: window.Ibles.pageContext.loggedIn,
            commentsContext: window.Ibles.commentsContext || {}
        });
    };
    
    function dependencies() {
        if (window.Ibles.pageContext.loggedIn) {
            return [
                "/static/js/jqplugins/jquery.notes.js",
                "/static/js/jqplugins/fancybox/source/jquery.fancybox.pack.js",
                "/static/js/fancybox-photoset.js",
                "/static/js/feedback.jq.2.js",
                "/static/drag_editor/dependencies/redactorInstructables/redactor_air_instructables.5.js",
                "/static/js/CommentControl.js"
            ];
        } else {
            return [
                "/static/js/jqplugins/jquery.notes.js",
                "/static/js/jqplugins/fancybox/source/jquery.fancybox.pack.js",
                "/static/js/fancybox-photoset.js"                
            ];
        }
    }

    head.load.apply(window, dependencies().concat(initialize));
})(jQuery);


// initialize achievements for comments
(function($){
    head.load(
        "/static/js/achievements.js",
        function() {
            var authorIds = getAuthorIdsFromPage(),
            authorIdObj = prepAuthorIds(authorIds);
            if (!_.isEmpty(authorIdObj))
                addAuthorAchievements(authorIdObj, "commentAuthorStats", renderCommentAuthorAchievements);
        }
    );
})(jQuery);