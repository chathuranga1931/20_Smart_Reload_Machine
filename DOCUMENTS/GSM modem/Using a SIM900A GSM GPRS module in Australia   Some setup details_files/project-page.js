// initialize ible header
(function($){  
    var buildHash = window.Ibles.pageContext.buildHash;
    head.load(
        "/static/js/ible-header.js?version={0}".format(buildHash),
        "//platform.twitter.com/widgets.js",
        function() {
            new IbleHeader($,
                window.Ibles.pageContext.numStepsByWordCount,
                window.Ibles.pageContext.allSteps,
                window.Ibles.pageContext.ibleUrl);
        }
    );    
})(jQuery);


// initialize photoset and statscard
(function($){
    head.load(
        "/static/js/photoset-initializer.js",
        "/static/js/statscard.js");
})(jQuery);


// see more related ibles action
(function($){
    $(function(){
        $('#seemore-related-ibles').click(function(e){
            e.preventDefault();
            $(this).closest('.seemore-container').remove();
            $('#related-instructables').find('li').filter(':hidden').show();
        });
    });
})(jQuery);

// load printIt if print-it button clicked
(function($){
    $(function(){
        $(".3d-hubs-print-it").click(function(clickEvent) {
            clickEvent.stopPropagation();
            head.load("/static/js/PrintIt.js", function(){
                var stlFile = $(clickEvent.target);
                var filename = stlFile.attr("data-filename");
                var fileUrl = stlFile.attr("data-fileurl");
                var modal = new PrintItView({
                    model: new PrintItModel({
                        filename: filename,
                        fileUrl: fileUrl
                    })
                }).render();
                $("body").append(modal);
            });
        })
    });
})(jQuery);


// ible page sidebar scroll fixed ad
(function($){
    var pageContext = window.Ibles.pageContext;
    if (!pageContext.showAds || (pageContext.ibleType == 'Guide'))
        return;    
    $(function(){
        var $mainContent = $('#main-content'),                
            $sidebar = $('#sidebar'),
            $ibleHeader = $('#ible-header'),
            $stickyAd = $('#ible-stickyad'),
            $sidebar = $('#sidebar'),
            padding = 22,
            stickyAdTop = $stickyAd.offset().top,
            updateStickyAdTop = true;
        
        $(window).bind('scroll', function(){
            var stickyAdHeight = $stickyAd.height(),
                $win = $(window),
                $omni = $('#omni'),
                scrollTop = $win.scrollTop(),
                sidebarHeight = $sidebar.height(),
                sidebarBottomOffset = sidebarHeight + $sidebar.offset().top,
                mainContentHeight = $mainContent.height(),
                mainContentBottomOffset = mainContentHeight + $mainContent.offset().top,
                topAdjust = $ibleHeader.outerHeight() + padding;

            if (updateStickyAdTop)
                stickyAdTop = $stickyAd.offset().top;

            // Height of ad content can vary, so let's set the parent height to 
            // the height of the child container since the child container will
            // be taken out of the flow of the page
            $stickyAd.parent().height(stickyAdHeight);

            if (sidebarHeight < mainContentHeight) {
                if ((scrollTop + stickyAdHeight) > (mainContentBottomOffset - topAdjust)) {
                    $stickyAd.css({top:'auto', position:'absolute', bottom:0, left:'auto'});
                    updateStickyAdTop = false;
                } else if (scrollTop > (stickyAdTop - topAdjust)) {
                    if ($win.width() < $omni.width()) {
                        $stickyAd.css({top:topAdjust+'px', bottom:'auto', position:'fixed', left: $sidebar.offset().left - $win.scrollLeft()});
                    } else {
                        $stickyAd.css({top:topAdjust+'px', bottom:'auto', position:'fixed', left:'auto'});
                    }
                    updateStickyAdTop = false;
                } else {
                    $stickyAd.css({top:'auto', bottom:'auto', left:'auto', position:'relative'});
                    updateStickyAdTop = true;
                }
            }                                
        });
    });    
})(jQuery);


// limits contest entries in add-to-contest modal on ible page to 3
(function($){    
    $(function() {        
        function limitContestEntry() {
            var usOnlyCheckBoxes = $('#addToContestModal input.us-only-checkbox'),
                addToContestButtons = $('#addToContestModal .addbtn'),
                limitNotice = $('#addToContestModal .limit-message'),
                filterAddedContestsBtns = function() {return $(this).data('flag') === 1;},
                filterUnaddedContestBtns = function() {return $(this).data('flag') === 0;},
                addedCount = addToContestButtons.filter(filterAddedContestsBtns).length;
                        
            if (addedCount >= 3) {
                limitNotice.css({color: 'red'});
                usOnlyCheckBoxes.attr('disabled', true);
                addToContestButtons.filter(filterUnaddedContestBtns).addClass('disabled');
            } else {
                limitNotice.css({color: 'black'});
                usOnlyCheckBoxes.attr('disabled', false);
                $.each(addToContestButtons.filter(filterUnaddedContestBtns), function() {
                    var addButton = $(this),
                        usOnlyContest = addButton.prev('.us-only-wrapper').length,
                        usOnlyChecked = usOnlyContest && addButton.prev().find('input:checked').length;
                    if (!usOnlyContest || usOnlyChecked) {
                        addButton.removeClass('disabled');
                    }
                });
            }
        }
        $('#addToContestModal .addbtn').bind('ajax-action-success', limitContestEntry);
        limitContestEntry();
    });
})(window.jQuery);


// addToContest modal U.S. only contest toggle & ajax response messages
(function($){
    if (window.Ibles.pageContext.ibleType == 'Guide')
        return;
    $(function(){
        $('.us-only-checkbox').click(function() {
            var addContestButton = $(this).parent().parent().find('.addbtn');
            if ($(this).is(':checked')) {
                addContestButton.removeClass('disabled');
            } else {
                addContestButton.addClass('disabled');
            }
        });

        $('.addbtn').ajaxActionBtn().bind('ajax-action-success', function(e, data) {
            if (($(this).data('action') == 'addToContest') && data) {
                var container = $(this).parent();
                container.children('p').remove();
                container.append('<p>'+data+'</p>');
            }
        });        
    });
})(jQuery);


// addToGroup modal group category selection
(function($){
    if (window.Ibles.pageContext.ibleType == 'Guide')
        return;    
    $(function(){
        $('select.group-category').on('change', function(){
            $(this).parent().find('.addbtn').data('groupCategory', $(this).val());
        }); 
    });
})(jQuery);


// buzz feed widget
(function($){
    (function(){
    BF_WIDGET_JS=document.createElement("script"); BF_WIDGET_JS.type="text/javascript";
    BF_WIDGET_SRC="http://ct.buzzfeed.com/wd/UserWidget?u=instructables.com&amp;to=1&amp;or=vb&amp;wid=1&amp;cb=" + (new Date()).getTime();
    setTimeout(function() {document.getElementById("BF_WIDGET_1").appendChild(BF_WIDGET_JS);BF_WIDGET_JS.src=BF_WIDGET_SRC},1);
    })();
})(jQuery);


// pinit pinterest button
(function($){
    (function(d){
      var f = d.getElementsByTagName('SCRIPT')[0], p = d.createElement('SCRIPT');
      p.type = 'text/javascript';
      p.async = true;
      p.src = '/static/js/pinit.js';
      p.setAttribute('data-pin-hover', true);
      f.parentNode.insertBefore(p, f);
    }(document));
    
    // adds "nopin='nopin'" attributes to images that we don't want pinned through pinterest bookmarklet
    $(function() {
        $('.nopin img').attr('nopin', 'nopin');    
    });    
})(jQuery);


// track visited categories & channels in local storage
(function($){
    if (window.Ibles.pageContext.ibleType == 'Guide')
        return;
    head.ready(function(){
        var categoryCounts = {},
            channelCounts = {},
            pageContext = window.Ibles.pageContext,
            ibleID = pageContext.ibleID,
            category = pageContext.ibleCategory,
            channel = pageContext.ibleChannel,
            path = pageContext.ibleUrl;

        if (_.isUndefined($.cookie('categoryTimer'))){
            //this ible has not been visited in the last 30 min to account for paging
            var expiry = moment().add(30,'m');
            $.cookie('categoryTimer', ibleID, {path:path, expires: expiry.toDate()});

            if (!_.isUndefined(localStorage['ibleCategories'])){
                categoryCounts = JSON.parse(localStorage['ibleCategories']);
            }
            if (_.isUndefined(categoryCounts[category])){
                categoryCounts[category] = 1;
            } else {
                categoryCounts[category] = categoryCounts[category] + 1;
            }
            localStorage['ibleCategories'] = JSON.stringify(categoryCounts);

            if (!_.isUndefined(channel)){ //international ibles have no channels
                if (!_.isUndefined(localStorage['ibleChannels'])){
                    channelCounts = JSON.parse(localStorage['ibleChannels']);
                }
                if (_.isUndefined(channelCounts[channel])){
                    channelCounts[channel] = 1;
                } else {
                    channelCounts[channel] = channelCounts[channel] + 1;
                }
                localStorage['ibleChannels'] = JSON.stringify(channelCounts);
            }
        }
    });
})(jQuery);


// scroll tracking google analytics event
(function($){
    head.load("/static/js/reader-tracker.js", function() {
        $(function(){
            new ReaderTracker()
                .track("instructable-steps", "DoneReadingSteps")
                .track("ible-stickyad", "SeenFullStickyAd")
        });
    });    
})(jQuery);
