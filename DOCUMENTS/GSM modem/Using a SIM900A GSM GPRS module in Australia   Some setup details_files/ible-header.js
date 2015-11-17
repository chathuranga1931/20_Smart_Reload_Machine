function IbleHeader($, numStepsByWordCount, allSteps, ibleUrl) {
    this.init($, numStepsByWordCount, allSteps, ibleUrl);
}

IbleHeader.prototype = {
    constructor: IbleHeader,
    init: function($, numStepsByWordCount, allSteps, ibleUrl) {
        var self = this;
        this.loggedIn = window.Ibles.pageContext.loggedIn;
        this.header = $('#ible-header');
        this.headerInner = $('#ible-header-inner');
        this.headerToggle = $('#ible-header-toggle');
        this.ibleStepNav = $('#ible-steps-nav');
        this.jumpToNav = $('#jumpto-btngroup');
        this.jumpToBtn = $('#jump-to-step-btn');
        this.nextBtn = this.jumpToBtn.next();
        this.stepBtns = $('.jump-to-link');
        this.stepCount = $('#ible-steps-nav a.btn').size();
        this.viewAllStepsBtn = $('.view-all-steps-btn');
        this.IMadeItButton = $('.header-imadeit-btn');
        this.googleShareButton = $('.google-share-button');
        this.facebookShareButton = $('.facebook-share-button');
        this.tumblrShareButton = $('.tumblr-share-button');
        this.voteDropdownToggle = $('#vote-dropdown-toggle');
        this.ibleUrl = window.location.port ? window.location.protocol + "//" + window.location.host + ":" + window.location.port + ibleUrl : window.location.protocol + "//" + window.location.host + ibleUrl;
        this.isMultiStepIble = this.ibleStepNav.length;
        this.currentStep = parseInt(window.location.hash.split("#step")[1]) || 0;
        this.allSteps = this.header.data('allsteps') || (allSteps == "true");
        this.onFirstPage = !!this.header.data('first-page');
        this.headerOffsetbottom = 0;
        this.numStepsByWordCount = parseInt(numStepsByWordCount);
        this.headerOffsetTop = 0;
        this.initMultiStepIble();
        this.enableVoteDropdown();
        this.enableFixHeader();
        this.enableIMadeItButton();
        this.enableSharing();
        document.body.addEventListener("keydown",function(event){self.autoScroll(event)},false);
    },

    autoScroll: function(event){
            if((event.keyCode == 32||event.keyCode == 34)&&!event.shiftKey){ //32 is spacebar, 34 is page down keydisable for shift spacebar (page up)
                if (document.activeElement.tagName=="BODY"){ //if the active element is an input and not the body, do not prevent default
                    event.preventDefault();
                    $('html, body').filter(':not(:animated)').animate({
                        scrollTop: $(window).scrollTop()+$(window).height()-(this.isExpanded() ? $('.header-bar').height() : 0)
                    }, "fast");                    
                    //window.scrollTo(0, $(window).scrollTop()+$(window).height()-(this.isExpanded() ? $('.header-bar').height() : 0));
                }else if(event.keyCode==34){
                    event.preventDefault(); //prevent default for page down key when a text area is focused
                }
            }
    },

    isFixed: function() {
      return this.header.hasClass('fixed');
    },
    
    isExpanded: function() {
      return this.header.hasClass('expanded');
    },

    cookie: function(name) {
      var re = new RegExp(name + "=([^;]+)"), value = re.exec(document.cookie);
      return (value != null) ? unescape(value[1]) : null;
    },
    enableSharing:function(){
        var that = this;
        this.googleShareButton.click(function(e){
            e.preventDefault();
            //code taken from google's docs
            window.open($(e.currentTarget).attr('href'),'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
            return false;
        });
        this.tumblrShareButton.click(function(e){
            e.preventDefault();
            var d=document,w=window,e=w.getSelection,k=d.getSelection,x=d.selection,s=(e?e():(k)?k():(x?x.createRange().text:0)),f='http://www.tumblr.com/share',l=d.location,e=encodeURIComponent,p='?v=3&u='+e(l.href) +'&t='+e(d.title) +'&s='+e(s),u=f+p;try{if(!/^(.*.)?tumblr[^.]*$/.test(l.host))throw(0);tstbklt();}catch(z){a =function(){if(!w.open(u,'t','toolbar=0,resizable=0,status=1,width=450,height=430'))l.href=u;};if(/Firefox/.test(navigator.userAgent))setTimeout(a,0);else a();}void(0)
        })

        this.facebookShareButton.click(function(e){
            if (typeof FB !== 'undefined'){
                e.preventDefault();
                FB.ui({
                    method:'share',
                    href:that.ibleUrl
                })
            }
        })
    },

    enableIMadeItButton:function(){
       var that = this;
        this.IMadeItButton.click(function(e){
            e.preventDefault();
            if (!window.Ibles.pageContext.loggedIn) {
                window.Ibles.authFlow.showLoginModal();
            } else {
                var commentBoxContainer = $('#add-comment-top'),
                    commentIMadeItButton= commentBoxContainer.find(".comment-imadeit-toggle"),
                    topSpacing = 10;
                $(window).scrollTop(commentBoxContainer.offset().top - that.header.outerHeight() - topSpacing);
                if (!commentIMadeItButton.hasClass('active')){
                    commentIMadeItButton.click();
                }
                $(this).blur();
                //todo:focus redactor here
            }
        });

    },
    goToIMadeIt:function(e){
        e.preventDefault();
        var commentBoxContainer = $('#add-comment-top'),
            commentIMadeItButton= commentBoxContainer.find(".comment-imadeit-toggle");
        $(window).scrollTop(commentBoxContainer.offset().top - this.header.outerHeight());
        if (!commentIMadeItButton.hasClass('active')){
            commentIMadeItButton.click();
        }
    },

    initMultiStepIble: function() {
      if (this.isMultiStepIble) {
        this.updateIntitialStep();
        this.positionStepNavTip();
        var stepNavCallback = $.proxy(this.jumpToNavClick, this);
        this.jumpToBtn.click(stepNavCallback);
        this.nextBtn.click(stepNavCallback);
        this.stepBtns.hover(
          function() {
            $(this).parent().addClass('open');
          },
          function() {
            $(this).parent().removeClass('open');
          }
        );

        if (this.allSteps === true || this.onFirstPage === true)
          this.stepBtns.click($.proxy(this.goToStep, this));
        this.jumpToNav.find('a').tooltip();

        if (this.loggedIn) {
          var ibleStepNavOpened = this.cookie('ibleStepNavOpened');
          if (ibleStepNavOpened == 1) {
            this.jumpToBtn.addClass('active');
            this.ibleStepNav.removeClass('collapsed');
          }
          this.viewAllStepsBtn.click($.proxy(this.viewAllStepsClick, this));
        }
      }
    },

    positionStepNavTip: function() {
    	var jumpBtn = this.jumpToBtn,
    	    jumpX = jumpBtn.position().left,
    	    parentX = jumpBtn.parent().position().left,
    	    totalX = parentX+jumpX,
    	    stepNavTip = this.ibleStepNav.find('.bubble-tip');
        	stepNavTip.css({'left':totalX+45});
        	stepNavTip.show();
    },

    updateIntitialStep: function() {
      var H = window.location.hash;
      if (H == '#intro') {this.currentStep = 0;}
      if (H == '#step1') {this.currentStep = 1;}
    },

    jumpToNavClick: function(e) {
      var $btn = $(e.target),
          header = this.header,
          ibleStepNav = this.ibleStepNav,
          onFirstPage = this.onFirstPage,
          allSteps = this.allSteps;

      // clicking on the icon inside the button should also count as the button being clicked
      if (!$btn.hasClass('.btn'))
        $btn = $btn.closest('.btn');

      // If we are on the first page or browsing allsteps, we want the next button to go the next section on the page
      // If we are on the first page and we are not browing allsteps, we want the second click on the next button to go to the step2 url
      if (onFirstPage || allSteps) {
        e.preventDefault();
        if ($btn.hasClass('next') && !$btn.hasClass('disabled')) {
          this.currentStep++;
          if (onFirstPage === true && allSteps === false && (this.currentStep === this.numStepsByWordCount)) {
              window.location = $btn.attr('href');
              return;
          }
          if (this.currentStep == this.stepCount-1)
            this.nextBtn.addClass('disabled');
          this.scrollToStep(this.currentStep);
        }
      }

      if ($btn.hasClass('steps-menu-toggle')) {
        document.cookie=(ibleStepNav.is(':hidden')) ? 'ibleStepNavOpened=1; path=/':"ibleStepNavOpened=0; path=/";
        this.positionStepNavTip();
        $btn.toggleClass('active');
        ibleStepNav.toggleClass('collapsed');
        header.parent().height(header.outerHeight());
        this.headerOffsetbottom = this.headerOffsettop + header.height();
      }
    },

    scrollToStep: function(stepIndex) {
      var anchorId = "stepanchor-step"+stepIndex;
      $(window).scrollTop($('#'+anchorId).offset().top-this.header.outerHeight());
      this.stepBtns.removeClass('active');
      $('#stepnav-step'+stepIndex).addClass('active');
    },

    goToStep: function(e) {
      e.preventDefault();
      var currentStep = this.currentStep,
          nextStep = $(e.target).data('stepindex'),
          stepCount = this.stepCount,
          nextBtn = this.nextBtn,
          allSteps = this.allSteps,
          numStepsByWordCount = this.numStepsByWordCount,
          onFirstPage = this.onFirstPage;
      if (nextStep == stepCount-1)
        nextBtn.addClass('disabled');
      if (nextStep >= 0 && nextStep < stepCount-1)
        nextBtn.removeClass('disabled');
      if (allSteps === true || (onFirstPage === true && nextStep < numStepsByWordCount)) {
        this.scrollToStep(nextStep);
        this.currentStep = nextStep;
      }
      else {
        window.location = $(e.target).attr('href');
      }
    },

    viewAllStepsClick: function(e) {
      e.preventDefault();
      var $btn = $(e.target);

      // clicking on the icon inside the button should also count as the button being clicked
      if (!$btn.hasClass('.btn'))
        $btn = $btn.closest('.btn');

      document.cookie = $btn.hasClass('active') ? 'ibleAllSteps=0; path=/':'ibleAllSteps=1; path=/';
      $btn.toggleClass('active');
      window.location = $btn.attr('href');
    },

    enableVoteDropdown: function() {
      if (this.voteDropdownToggle.length) {
        var self = this;
        this.voteDropdownToggle.click($.proxy(this.toggleVoteMenu, this));
      }
    },

    toggleVoteMenu: function(e) {
      e.preventDefault();
      var parent = $(this.voteDropdownToggle).parent(),
          wasActive = parent.hasClass('open');
      parent.toggleClass('open');

      if (wasActive) {
        this.hideVoteMenu();
      } else {
        $('html').on('click.vote-dropdown', function(e) {
          var target = $(e.target);
          if (target.closest('.vote-dropdown').length == 0) {
            parent.removeClass('open');
            $('html').off('click.vote-dropdown');
          }
        });
      }
    },

    hideVoteMenu: function(e) {
      var menuToggleBtn = this.voteDropdownToggle,
          parent = menuToggleBtn.parent();

      if (parent.hasClass('open')) {
        parent.removeClass('open');
        $('html').off('click.vote-dropdown');
      }
    },

    enableFixHeader: function() {
      var self = this,
          header = this.header,
          headerInner = this.headerInner,
          headerToggle = this.headerToggle,
          headerState, ibleHeaderCollapsed;

      ibleHeaderCollapsed = (this.cookie('ibleHeaderCollapsed') == 1);
      headerState = (ibleHeaderCollapsed) ? 'collapsed':'expanded';
      
      headerToggle.click(function(){
        var visible = headerInner.is(':visible');
        document.cookie=(visible) ? 'ibleHeaderCollapsed=1; path=/':"ibleHeaderCollapsed=0; path=/";
        if (visible) {
          headerInner.slideUp('fast', function(){
            header.removeClass('expanded').addClass('collapsed');
            headerState = 'collapsed';
          });
        } else {
          headerInner.slideDown('fast', function() {
            header.removeClass('collapsed').addClass('expanded');
            headerState = 'expanded';
          });
        }
      });

      var that = this;
      $(document).on('sponsoredCollectionAdCallback',function(e,slot){
        if (slot.indexOf("leaderboard") > -1) {
            that.initializeStickyHeader.apply(that);
        }
      });
      //make sure sticky header is initialized even if there is no ad on the page
      window.setTimeout($.proxy(this.initializeStickyHeader, this), 5000)

    },

    initializeStickyHeader: function(){
      var self = this,
        header = this.header,
        headerInner = this.headerInner,
        headerToggle = this.headerToggle,
        headerState,
        updateFlag = true,
        headerOffsettop = header.offset().top;

      if (this.headerInitialized === true){
          return;
      }
      this.headerInitialized = true;
      headerState = (this.cookie('ibleHeaderCollapsed') == 1) ? 'collapsed':'expanded';
        
      self.headerOffsettop = headerOffsettop;
      self.headerOffsetbottom = headerOffsettop + header.height();

      $(window).bind('scroll.ibleheader', function() {
        var scrollTop = $(window).scrollTop();

        function fixHeader() {
              if (updateFlag) {
              header.parent().height(header.outerHeight());
                updateFlag = false;
                header.addClass('header-gradient fixed ' + headerState);
                headerToggle.show();
                }
        }

        function unfixHeader() {
              header.removeClass('header-gradient fixed ' + headerState);
                headerToggle.hide();
                updateFlag = true;
        }

        if ((header.hasClass('collapsed') || headerState == 'collapsed') && !header.hasClass('expanded')) {
            if (scrollTop > self.headerOffsetbottom) {
              fixHeader();
              headerInner.hide();
                } else {
            unfixHeader();
            headerInner.show();
              }
          } else {
            if (scrollTop > self.headerOffsettop) {
              fixHeader();
            } else {
              unfixHeader();
            }
          }
      });
    }
};
