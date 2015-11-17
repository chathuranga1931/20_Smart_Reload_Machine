(function($){
    window.googletag = googletag || {};
    window.googletag.cmd = googletag.cmd || [];
    (function() {
        var gads = document.createElement("script");
        gads.async = true;
        gads.type = "text/javascript";
        var useSSL = "https:" == document.location.protocol;
        gads.src = (useSSL ? "https:" : "http:") + "//www.googletagservices.com/tag/js/gpt.js";
        var node =document.getElementsByTagName("script")[0];
        node.parentNode.insertBefore(gads, node);
    })();

    sbi_morpheus.register('gpt-ad-sidebar-brand', 'd129bba99e44daecd7e6'); //  instructables _300_apex
    sbi_morpheus.register('gpt-ad-med-rectangle', 'd129bba99e44daecd7e6');   //  instructables _300_apex
    sbi_morpheus.register('gpt-ad-inline-med-1', 'd129bba99e44daecd7e6');   //  instructables _300_apex
    sbi_morpheus.register('gpt-ad-inline-med-2', 'd129bba99e44daecd7e6');   //  instructables _300_apex
    sbi_morpheus.register('gpt-ad-leaderboard', '8ce389d96c42f9bc8f0d');  //  instructables _728_apex

    var pageContext = window.Ibles.pageContext,
        adSlot = pageContext.adSlot;
        
    googletag.cmd.push(function() {
        var leaderboard = googletag.defineSlot("/1022072/{0}_leaderboard".format(adSlot), [[728, 90], [970, 200],  [970, 300], [970, 250]], "gpt-ad-leaderboard")
            .addService(googletag.pubads());
        googletag.defineSlot("/1022072/{0}_med_rectangle".format(adSlot), [[300, 250],[300, 600],[160, 600],[300, 500]], "gpt-ad-med-rectangle")
            .addService(googletag.pubads());
        googletag.defineSlot("/1022072/brand_{0}_med_rectangle".format(adSlot), [[300, 250], [300, 600], [160, 600], [300, 601]], "gpt-ad-sidebar-brand")
            .addService(googletag.pubads());
        googletag.defineSlot("/1022072/{0}_inline_med_rectangle".format(adSlot), [300, 250], "gpt-ad-inline-med-1")
            .addService(googletag.pubads());
        googletag.defineSlot("/1022072/rightside_inline_med_rectangle", [300, 250], "gpt-ad-inline-med-2")
            .addService(googletag.pubads());
        googletag.pubads().setTargeting("content", pageContext.adTargetContent);
        googletag.pubads().setTargeting("id", pageContext.adTargetId);
        googletag.pubads().setTargeting("category", pageContext.adTargetCategory);
        googletag.pubads().setTargeting("channel", pageContext.adTargetChannel);
        googletag.pubads().setTargeting("author", pageContext.adTargetAuthor);
        googletag.pubads().setTargeting("step", pageContext.adTargetStep);
        googletag.pubads().setTargeting("featured", pageContext.adTargetFeatured);
        googletag.pubads().setTargeting("status", pageContext.adTargetStatus);
        googletag.pubads().setTargeting("loggedin", pageContext.loggedIn);
        googletag.pubads().setTargeting("adtest", pageContext.adTargetAdTest);
        if (pageContext.adTargetContests)
            googletag.pubads().setTargeting("contest", pageContext.adTargetContests);
        if (pageContext.adTargetKeywords)
            googletag.pubads().setTargeting("keyword", pageContext.adTargetKeywords);
        if (pageContext.adTargetGroups)
            googletag.pubads().setTargeting("group", pageContext.adTargetGroups);
        googletag.pubads().enableSingleRequest();
        googletag.pubads().collapseEmptyDivs();
        googletag.pubads().addEventListener('slotRenderEnded', function(event) {
            // Enable header sticky header behavior (and any other post-ad JS) now.
            // see https://developers.google.com/doubleclick-gpt/reference#googletag.events.SlotRenderEndedEvent
            if (event.slot === leaderboard) {
                $(document).trigger('sponsoredCollectionAdCallback', ["leaderboard"] );
            }
        });
        googletag.enableServices();
    });

    googletag.cmd.push(function() {
        sbi_morpheus.callOperator();
    });
})(jQuery);