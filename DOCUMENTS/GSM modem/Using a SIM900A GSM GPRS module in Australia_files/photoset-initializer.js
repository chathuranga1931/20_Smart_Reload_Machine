(function($){
    head.load(
        "/static/js/jqplugins/jquery.notes.js",
        "/static/js/jqplugins/fancybox/source/jquery.fancybox.pack.js",
        "/static/js/fancybox-photoset.js",
        "/static/js/jqplugins/lazyload/jquery.lazyload.min.js",
        function() {
            function imgLoaded(img) {
                if (!img.complete || (typeof img.naturalWidth != "undefined" && img.naturalWidth == 0)) {
                    return false;
                }
                return true;
            }

            function parseNotes(notesString) {
                if (typeof notesString === 'object')
                    return notesString;
                return eval(notesString);
            }

            $(function () {       
                // see more images
                $('.photoset-seemore').click(function(e) {
                    e.preventDefault();
                    var photoset = $(this).closest('.photoset')
                    photoset.children('.row').filter(':hidden').show();
                    $('html,body').animate({scrollTop:$(window).scrollTop()+1}, 100);                   
                    $(this).closest('.row').remove();
                });   

                // lazyload images
                $(".lazyphoto").show().lazyload({
                    effect: "fadeIn",
                    threshold: 200,
                    load: function() {
                        // load image notes for the rest of the images that are in a row by itself and are lazily loaded
                        var notesContainer = $(this).closest(".photoset-link");
                        if ($(this).closest('.row').children('.photoset-link').size() === 1) {
                            var notes = parseNotes($(this).data("notes"));
                            if (!_.isEmpty(notes)) {
                                $(this).notes(notes, false, notesContainer);
                            }            
                        }
                    }
                });

                $(".photoset-link").each(function() {
                    // Replace href attribute with value needed to display lightbox content
                    $(this).attr('href', $(this).data('fancybox-href'));

                    // toggle notes icon
                    $(this).bind("mouseenter mouseleave", function(){
                        $(this).toggleClass('selected');
                    });

                    // enable clicking on the note-holder to open the gallery
                    $(this).children(".note-holder").live('click', function(){
                        $(this).parent(".photoset-link").click();          
                    });
                });

                // enable clicking on note-holder and fancybox-image to open image url
                $(".photoset-fancybox .note-holder, .photoset-fancybox .fancybox-image").live('click', function(){
                    window.location.href = $($.fancybox.group[$.fancybox.current.index]).data('href');
                });

                // Initialize lightbox gallery and image note upon rendering
                $(".photoset-link").fancybox({    
                    afterClose: function() {
                        if (window.history && history.pushState) {
                            $.fancybox.statePushed = false;
                            if ($.fancybox.closeFromBack)
                                $.fancybox.closeFromBack = false;
                            else
                                history.back();
                        }
                    },

                    afterShow: function () {
                        if (window.history && history.pushState) {
                            var photosetLink = $.fancybox.group[$.fancybox.current.index],
                            state = {'photosetLinkId': photosetLink.id},
                            href = $(photosetLink).data('href');
                            $.fancybox.lastState = state;
                            if (!$.fancybox.statePushed) {
                                $.fancybox.statePushed = true;
                                history.pushState(state, null, href);
                            } else {
                                history.replaceState(state, null, href);            
                            }
                        }

                        var notesContainer = $.fancybox.inner;
                        if (notesContainer) {
                            var galleryImg = notesContainer.find("img:first"),
                                curPhotoLink = $($.fancybox.current.element),
                                notes = parseNotes(curPhotoLink.data("notes"));                
                            if (!_.isEmpty(notes)) {
                                galleryImg.notes(notes, false, notesContainer);
                            }
                            dataLayer.push({
                                'event': 'GAVirtualPageView',
                                'GAVirtualPageViewPage': '/event/photoset/photo/' + curPhotoLink.closest('.photoset').attr('data-entry-url') + 'image' + $.fancybox.current.index + '/'
                            });          
                        }         
                    }          
                });    
            });   

            // Initialize image notes for first photoset image if it wasn't lazy loaded
            $(window).load(function() {       
                $(".photoset").each(function() {
                    var firstImg = $(this).find("img:first"),
                        notes = parseNotes(firstImg.data("notes")),
                        notesContainer = firstImg.closest(".photoset-link");
                    if (!firstImg.hasClass('lazyphoto') && !_.isEmpty(notes) && imgLoaded(firstImg[0])) {
                        firstImg.notes(notes, false, notesContainer);
                    }
                });
            });

            $(window).bind("popstate", function(e) {
                if (window.history && history.pushState) {
                    if (e.originalEvent && e.originalEvent.state && !$.fancybox.isOpen) {
                        $.fancybox.statePushed = true;
                        $('#'+e.originalEvent.state.photosetLinkId).click();
                    } else if ($.fancybox.isOpen) {
                        $.fancybox.closeFromBack = true;
                        $.fancybox.close();
                    }
                }
            });

            $(window).bind('pageshow', function(e){
                if (window.history && history.state) {
                    if (history.state.photosetLinkId) {        
                        $.fancybox.statePushed = true;
                        $('#'+history.state.photosetLinkId).click();
                    }
                }
            });

            $(window).bind('unload', function(e){
                if (window.history && history.replaceState) {
                    if ($.fancybox.lastState && ($.fancybox.originalUrl != window.location.href)) {
                        // In safari, if we call replacestate with a new url during an unload event, then the browser will
                        // ignore url on address bar and will effectively redirect back to the originalUrl. I don't think
                        // this can solve this without trading off another history functionality.
                        // Chrome has its issues as well.
                        history.replaceState($.fancybox.lastState, null, $.fancybox.originalUrl);    
                    }
                }
            });
        }
    );
})(jQuery);