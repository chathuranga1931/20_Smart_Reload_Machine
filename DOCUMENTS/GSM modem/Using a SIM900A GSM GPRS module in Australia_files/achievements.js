var memberAuthorStats,
    commentAuthorStats,
    achievementsJSON;

/* ================== Helper Functions ========================= */

function fetchAuthorStats(authorIdObj, statsName, callback) {
    $.get("/json-api/getAuthorsStats?" + $.param(authorIdObj))
        .done(function(data) {
            if (window[statsName] !== undefined) {
                window[statsName] = _.extend(window[statsName], data['authorsStats']);
            }
            else {
                window[statsName] = data['authorsStats'];
            }
            $.get("/static/js/achievements.json").done(function(achievementsData){
                achievementsJSON = $.parseJSON(achievementsData)['achievements'];
                if (typeof(callback) === 'function') {
                    callback();
                }
            });
        });
}

function getAuthorIdsFromPage() {
    // For comments, not member page
    var $authorAchievementDivs = $('.comment-author-achievements'),
        authorIds = [];

    $authorAchievementDivs.each(function(index, element) {
        authorIds.push($(this).data('authorid'));
    });

    return authorIds;
}

function prepAuthorIds(authorIds) {
    var authorIdObjects = [];
    if (authorIds.length > 0) {
        _.each(authorIds, function(authorId) {
            authorIdObjects.push({name: 'id', value: authorId})
        });
    }
    return authorIdObjects;
}


/* =================== Main Functions ======================== */


function addAuthorAchievements(authorIdObj, statsName, callback) {
    // The last case is for when someone comments for the first time on a thread with comments.
    if (window[statsName] === undefined || achievementsJSON === undefined ||
        (statsName === 'commentAuthorStats'
            && window[statsName] !== undefined
            && _.keys(authorIdObj).length === 1
            && !_.has(window[statsName], authorIdObj['id']))
        ) {

        fetchAuthorStats(authorIdObj, statsName, function() {
            processAchievements(statsName, callback);
        });
    }
    else {
        processAchievements(statsName, callback);
    }
}

function processAchievements(statsName, callback) {
    if (typeof(callback) === 'function') {
        _.each(window[statsName], function(val, authorId) {
            callback.call(this, authorId, window[statsName]);
        });
    }
}

function numMedallions(authorId, stats) {

    var numAuthorMedallions = 0;

    if (stats !== undefined && stats.hasOwnProperty(authorId)) {
        var authStat = stats[authorId];

        if (stats.error === undefined) {
            var properties =
                {views: authStat.totalInstructableViews + authStat.totalGuidesViews,
                featured: authStat.featuredInstructablesCount + authStat.featuredGuideCount,
                comments: authStat.numCommentsMade};

            _.each(properties, function(val, key) {
                // Loop through properties and check if author has an achievement.
                // As soon as we know the author has one achievement, stop checking.
               numAuthorMedallions += checkAchievement(key, val);
            });

        }
    }

    return numAuthorMedallions;

    function checkAchievement(achievementType, authorStatProperty) {

        if (authorStatProperty >= achievementsJSON[achievementType]['gold']['criterion']) {
            return 1;
        }
        else if (authorStatProperty >= achievementsJSON[achievementType]['silver']['criterion']) {
            return 1;
        }
        else if (authorStatProperty >= achievementsJSON[achievementType]['bronze']['criterion']) {
            return 1;
        }
        else {
            return 0;
        }
    }
}


function renderMemberPageAchievements(authorId, stats, changeMedallionOnHover) {
    if (stats !== undefined && stats.hasOwnProperty(authorId)) {
        var memberStat = stats[authorId];

        if (memberStat.error === undefined) {
            var properties =
            {views: memberStat.totalInstructableViews + memberStat.totalGuidesViews,
                featured: memberStat.featuredInstructablesCount + memberStat.featuredGuideCount,
                comments: memberStat.numCommentsMade};

            _.each(properties, function(val, key) {
                checkAndAddAchievement(key, val);
            });

        }
    }

    function checkAndAddAchievement(achievementType, authorStatProperty) {

        if (authorStatProperty >= achievementsJSON[achievementType]['gold']['criterion']) {
            renderMedallion('gold', achievementType);
        }
        else if (authorStatProperty >= achievementsJSON[achievementType]['silver']['criterion']) {
            renderMedallion('silver', achievementType);
        }
        else if (authorStatProperty >= achievementsJSON[achievementType]['bronze']['criterion']) {
            renderMedallion('bronze', achievementType);
        }

        function renderMedallion(medalType, achievementType, changeMedallionOnHover) {

            // Assuming a gold-level "views" achievement:
            // Icon next to user pic gets is set to gold views by adding class small-medallion-views-gold; display is set to visible
            // Coin icon in popover is set to gold views by adding class coin-views-gold
            // Text in popover above coin gets set to "Gold Medal"
            // Coin icon is set to be visible

            if (medalType === 'gold' || medalType === 'silver' || medalType === 'bronze') {

                var $achievementsUberWrapper = $('#member-medallions-wrapper'),
                    $achievementWrapper = $('#member-medallion-' + achievementType + '-wrapper'),
                    $achievementIconTop = $achievementWrapper.find('.member-medallion-top.member-medallion-' + achievementType),
                    $achievementIconBottom = $achievementWrapper.find('.member-medallion-bottom.member-medallion-' + achievementType),
                    $achievementCriterionText = $achievementWrapper.find('#member-medallion-' + achievementType + '-criterion'),
                    $achievementMedalType = $achievementWrapper.find('#member-medallion-' + achievementType + '-medal-type'),
                    $medallionCaret = $achievementWrapper.find('.medallion-caret');

                $achievementIconTop.addClass(achievementsJSON[achievementType][medalType]['cssClass']['medallionNoText']);
                $achievementIconBottom.addClass(achievementsJSON[achievementType][medalType]['cssClass']['medallionText']);
                $medallionCaret.addClass(achievementsJSON[achievementType][medalType]['cssClass']['medallionBar']);
                $achievementCriterionText.text(achievementsJSON[achievementType][medalType]['desc']);
                $achievementMedalType.text(medalType);

                if ($achievementWrapper.is(':hidden')) $achievementWrapper.show();
                if ($achievementsUberWrapper.is(':hidden')) $achievementsUberWrapper.show();

            }
        }
    }
}

function renderCommentAuthorAchievements(authorId, stats) {
    if (stats !== undefined && stats.hasOwnProperty(authorId)) {
        var commentStats = stats[authorId],
            authorHasAchievement = false;

        if (commentStats.error === undefined) {
            var properties =
            {views: commentStats.totalInstructableViews + commentStats.totalGuidesViews,
                featured: commentStats.featuredInstructablesCount + commentStats.featuredGuideCount,
                comments: commentStats.numCommentsMade};

            _.each(properties, function(val, key){
                checkAndAddAchievement(key, val);
            });

            renderPopover(authorHasAchievement);
        }
    }

    function renderPopover(hasAchievement) {
        if (hasAchievement) {
            // Now that the achievements have been added to the popover content div,
            // we need to set the actual popover to contain that content
            var $achievementWrapper = $('.achievements-' + authorId),
                popoverContent = $achievementWrapper.find('.medallion-popover-wrapper').html();

            // using a custom template for the popover so that we can add in our own achievement-popover class
            $achievementWrapper.popover({
                container: 'body',
                placement: 'top',
                trigger: 'hover',
                html: true,
                content: popoverContent,
                template: '<div class="popover achievement-popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
            });
        }
    }

    function checkAndAddAchievement(achievementType, authorStatProperty) {

        if (authorStatProperty >= achievementsJSON[achievementType]['gold']['criterion']) {
            renderMedallion('gold', achievementType);
            authorHasAchievement = true;
        }
        else if (authorStatProperty >= achievementsJSON[achievementType]['silver']['criterion']) {
            renderMedallion('silver', achievementType);
            authorHasAchievement = true;
        }
        else if (authorStatProperty >= achievementsJSON[achievementType]['bronze']['criterion']) {
            renderMedallion('bronze', achievementType);
            authorHasAchievement = true;
        }

        function renderMedallion(medalType, achievementType) {

            // Assuming a gold-level "views" achievement:
            // Icon next to user pic gets is set to gold views by adding class acheivement-views-gold; display is set to visible
            // Coin icon in popover is set to gold views by adding class coin-views-gold
            // Text in popover above coin gets set to "Gold Medal"
            // Coin icon is set to be visible

            if (medalType === 'gold' || medalType === 'silver' || medalType === 'bronze') {
                var $achievementWrapper = $('.achievements-' + authorId),
                    $achievementIcon = $achievementWrapper.find('.small-medallion-' + achievementType),
                    $achievementPopoverWrapper = $achievementWrapper.find('.medallion-popover-wrapper'),
                    $achievementPopoverMedallionWrapper = $achievementPopoverWrapper.find('.popover-medallion-' + achievementType + '-wrapper'),
                    $achievementCoinIcon = $achievementPopoverWrapper.find('i.popover-medallion-' + achievementType);

                $achievementIcon.addClass(achievementsJSON[achievementType][medalType]['cssClass']['medallionAvatar']).show();
                $achievementCoinIcon.addClass(achievementsJSON[achievementType][medalType]['cssClass']['medallionText']);
                $achievementPopoverMedallionWrapper.find('p').addClass(achievementsJSON[achievementType][medalType]['cssClass']['medallionColor']).text(medalType + " Medal");
                $achievementPopoverMedallionWrapper.show();

                if ($achievementWrapper.is(':hidden')) $achievementWrapper.show();
            }
        }
    }
}
