(function($){
       
Ibles.package("Ibles.views", "Ibles.models");

Ibles.views.BaseAuth = Backbone.View.extend({ 
   
    resetAction: function($form, successCallback, errorCallback) {
        var buttonTrigger = $form.find('.auth-action'),
            password = $form.find('input[name="newPassword"]').val(),
            self = this;            
        buttonTrigger.button('loading');        
        Ibles.session.resetPassword({
            email: $form.find('input[name="screenName"]').val(),
            resetCode: $form.find('input[name="tempCode"]').val(),
            password: password,
            passRT: password
        },{
            success: function(resetData){
                self.loginActionWithParams(resetData["screenName"], password, buttonTrigger, function(loginData){
                    if (successCallback) successCallback(loginData);
                }, function() {
                    if (errorCallback) errorCallback();
                });
            },
            error: function(data){
                if (errorCallback) errorCallback(self.makeErrorMessages(data));
            },
            complete: function() {
                buttonTrigger.button('reset');
            }
        });
    },

    forgotAction: function($form, successCallback, errorCallback){
        var buttonTrigger = $form.find('.auth-action'),
            email = $form.find('input[name="email"]').val(),
            self = this;
        buttonTrigger.button('loading');        
        Ibles.session.forgotPassword({email: email}, {
            success: function(data){
                if (successCallback) successCallback({email: email});
            },
            error: function(data){
                if (errorCallback) errorCallback(self.makeErrorMessages(data));
            },
            complete: function() {
                buttonTrigger.button('reset');
            }
        });
    },

    loginAction: function($form, successCallback, errorCallback){
        this.loginActionWithParams(
            $form.find('input[name="u"]').val(), 
            $form.find('input[name="p"]').val(),
            $form.find('.auth-action'),
            successCallback,
            errorCallback);
    },

    loginActionWithParams: function(username, password, buttonTrigger, successCallback, errorCallback){
        var self = this;
        buttonTrigger.button('loading');
        Ibles.session.login({
            p: password,
            u: username,
            RememberME: 'true'
        }, {
            success: function(data){
                if (successCallback) successCallback(data);
            },
            error: function(data){
                if (errorCallback) errorCallback(self.makeErrorMessages(data));
            },
            complete: function() {
                buttonTrigger.button('reset');
            }
        });
    },

    signupAction: function($form, successCallback, errorCallback, extraParams){
        var buttonTrigger = $form.find('.auth-action'),
            password = $form.find('input[name="password"]').val(),
            screenName = $form.find('input[name="screenName"]').val(),
            email = $form.find('input[name="email"]').val(),
            self = this;
                
        buttonTrigger.button('loading');
        Ibles.session.register(_.extend({
            email: email,
            screenName: screenName,
            password: password,
            passRT: password,                    
            sendNewsletter: 'true',
            RememberME: 'true'
        }, extraParams || {}), {
            success: function(signupData) {
                self.loginActionWithParams(screenName, password, buttonTrigger, function(loginData){
                    if (successCallback) successCallback({
                        screenName: screenName,
                        password: password
                    });
                });
            },
            error: function(data) {
                if (errorCallback) errorCallback(self.makeErrorMessages(data));
            },
            complete: function() {
                buttonTrigger.button('reset');
            }
        });
    },

    postAuthRedirect: function(options) {
        var currentUrl = window.location.href,
            onAuthPath = _.reduce(options.authPaths, function(memo, authPath) {
                return memo || (currentUrl.indexOf(authPath) >= 0);
            }, false);
        
        if (!onAuthPath) {
            window.location.reload(true);
        } else {
            var nextPageValue = Ibles.getQueryStringParam(options.nextPageParameter);
            if (nextPageValue) {
                window.location = nextPageValue;
            } else {
                window.location = "/";
            }
        }
    },

    registerSubmitHandler: function($form, submitHandler) {
        var showErrors = function(errorMap, errorList){
                _.each(errorList, function(error){
                    $(error.element).tooltip({title:error.message, trigger:"manual"});
                    $(error.element).tooltip('show');
                    //tooltip position is set using js in bootstrap so we have to override it here
                    $(error.element).next('.tooltip').css({left:'auto',right:'20px'});
                    window.setTimeout(function() {
                        $(error.element).tooltip('hide').tooltip('destroy');
                    }, 3000)
                })
            };            
        // uses jquery.validate plugin to handle form validations
        $form.each(function() {
           $(this).validate({
               submitHandler: submitHandler,
               showErrors:showErrors
           });
        });
    },

    usernameCheck: function(username, successCallback, errorCallback) {
        if (username.length) {
            $.ajax({
                type: "GET",
                url: "/ajax/AjaxUserNameChecker/",
                data: {'userName' : username},
                dataType: "json",
                success: function(data){
                    if (data.error) {
                        if (errorCallback) errorCallback(data);
                    } else {
                        if (successCallback) successCallback(data);
                    }
                },
                error: function(jqXhr) {
                    if (errorCallback) errorCallback(jqXhr);
                }
            });
        }
    },

    makeErrorMessages: function(data) {
        var compiledErrors;
        if (!_.isEmpty(data.error)) {
            compiledErrors = Ibles.T(data['error']);
        } else if (!_.isEmpty(data.validationErrors)) {
            var errors = data['validationErrors'],
                compiledErrors = _.reduce(_.keys(errors), function(memo, key){
                    if (key !== "robocheck")
                        return memo + " " + Ibles.T(errors[key]);
                    return memo;
                }, "");
    
        }
        if (_.isEmpty(compiledErrors))
            compiledErrors = Ibles.locale.errors.somethingWentWrong;
        return compiledErrors;        
    },

    renderAuthError: function($form, error){
        var $label = $form.find('.error-label');
        $label.text(error);
        $label.slideDown();
    },

    hideVisibleModals: function() {
        $('.auth-modal:not(.inline)').filter(':visible').modal('hide');
    },

    registerVisibleHandler: function($form, extraCallback) {
        $form.each(function(){
            var $form = $(this),
                $modalContainer = $form.closest('.modal:not(.inline)'),
                inModal = $modalContainer.length,
                callback = function() {
                    var $visibleInput = $form.find('input').filter(':visible:first');
                    if ($visibleInput.length) {
                        $visibleInput.focus();
                        if (extraCallback) extraCallback($form);
                    }
                }; 
            if (inModal) { 
                $modalContainer.on('shown', callback);
            } else {
                callback();
            }
        });
    },

    setUTMZCookie: function(){
        function setCookie(cname, cvalue, exdays, path) {
            var d = new Date(), expires;
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires + "; path=" + path;
        }

        function getCookie(cname) {
            var name = cname + "=",
                ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
            }
            return "";
        }

        var maxChannel,
            maxCategory,
            utmzCookie = getCookie('__utmz'),
            maxString = "";
        if (!_.isUndefined(localStorage['ibleCategories'])) {
            var categories = JSON.parse(localStorage['ibleCategories']);
            maxCategory= _.max(_.pairs(categories), function(pair){
                return pair[1];
            })[0];
            maxString += maxCategory;
        }
        if (!_.isUndefined(localStorage['ibleChannels'])) {
            var channels = JSON.parse(localStorage['ibleChannels']);
            maxChannel= _.max(_.pairs(channels), function(pair){
                return pair[1];
            })[0];
            maxString = maxString ? maxString + "_" + maxChannel : maxChannel;
        }
        if (maxString !== ""){
            if (utmzCookie){
                if (utmzCookie.match('utmcm=')){
                    //replace the portion of the cookie that says utmcm=SOMETHING followed by | or the end of the string
                    utmzCookie.replace(/utmcm=[^\|]+(?=$|\|)/g,"utmcm=" + maxString)
                } else {
                    utmzCookie = utmzCookie + "|utmcm=" + maxString;
                }
            } else {
                utmzCookie = "utmcm=" + maxString;
            }
        }
        //default age for utmz cookies is 6 months
        setCookie('__utmz',utmzCookie, 6*30, "/");
    }                        
});


Ibles.views.Signup = Ibles.views.BaseAuth.extend({
    initialize: function(options) {
        var $form = $('.auth-form.register-form');
        this.options = options;
        _.bindAll(this, 'submitSignup');
        this.registerUsernameCheck();
        this.registerSubmitHandler($form, this.submitSignup);
        this.registerVisibleHandler($form, function($form){
            if (!$form.data('robocheck')) {
                $form.data('robocheck', new Ibles.views.RoboCheckView({el: $form.find('.robocheck-container')}));  
            }
        });
    },

    showModal: function() {
        $('.auth-register-modal:not(.inline)').modal('show');
    },
    
    submitSignup: function(form) {
        var $form = $(form),
            robocheck = $form.data('robocheck'),
            self = this;
        try {
            this.setUTMZCookie();
        } catch(e) {}
        this.signupAction($form, function(data){
            self.postAuthRedirect(_.extend(data, self.options));
        }, function(error){
            self.renderAuthError($form, error)
            robocheck.refresh();
        }, _.extend({answer: robocheck.model.get("selectedAnswers").join()}, this.additionalSignupParams($form)));                            
    },

    additionalSignupParams: function($form) {
        return {
            source: $form.find('input[name="sourcea"]').val()
        }
    },
    
    registerUsernameCheck: function() {
        var self = this;
        $('.auth-register-modal .username-field').keyup(_.throttle(function(){
            var $field = $(this),
                username = $field.val().trim();
            
            self.usernameCheck(username, function(data){
                if ($field.next().hasClass('username-status')) {
                    $field.next().remove();
                }
            }, function(data){
                var $alert = $field.closest('form').find('.alert-error');
                if (!$alert.length) {
                    $alert = $('<p class="help-block username-status alert alert-error">'),
                    $field.after($alert);
                }
                $alert.text($field.data("validation-username-message"));                
            })
        }, 1000, {leading: false}));
    },
    
    postAuthRedirect: function(options) {
        var proItem = Ibles.getQueryStringParam("proItem"),
            sourcea = Ibles.getQueryStringParam("sourcea"),
            sourceaUrl = Ibles.getQueryStringParam("sourceaUrl");
        if (proItem) {
            window.location = "/payment/pay/?proItem="+proItem+"&sourcea="+sourcea+"&sourceaUrl="+sourceaUrl;
        } else if (sourceaUrl) {
            window.location = sourceaUrl;
        } else {
            Ibles.views.BaseAuth.prototype.postAuthRedirect.apply(this, arguments);
        }
    }    
});


Ibles.views.Login = Ibles.views.BaseAuth.extend({
    initialize: function(options) {
        var $form = $('.auth-form.login-form');
        _.bindAll(this, 'submitLogin');
        this.options = options;
        this.registerSubmitHandler($form, this.submitLogin);
        this.registerVisibleHandler($form, function($form){
            $form.closest('.modal').find('.carousel').carousel({interval: 3000});
        });
    },

    showModal: function() {
        $('.auth-login-modal:not(.inline)').modal('show');
    },

    submitLogin: function(form) {
        var $form = $(form),
            self = this;
        this.loginAction($form, function() {
            self.postAuthRedirect(self.options);
        }, function(error) {
            $form.parent().find('.carousel').slideUp({duration:'fast', queue:false});
            self.renderAuthError($form, error);
        }); 
    }       
});


Ibles.views.Forgot = Ibles.views.BaseAuth.extend({
    initialize: function(options) {
        var $form = $('.auth-form.forgot-form');
        _.bindAll(this, 'submitForgot', 'submitForgotSuccess');
        this.options = options;
        this.resetView = this.makeResetView(options);
        this.registerSubmitHandler($form, this.submitForgot);
        this.registerVisibleHandler($form);        
    },

    makeResetView: function(options) {
        return new Ibles.views.Reset(options);
    },

    showModal: function() {
        $('.auth-forgot-modal:not(.inline)').modal('show');
    },
    
    submitForgot: function(form) {
        var $form = $(form),
            self = this;
        this.forgotAction($form, this.submitForgotSuccess, function(error) {
            self.renderAuthError($form, error);
        });
    },

    submitForgotSuccess: function(data) {
        this.hideVisibleModals();
        this.resetView.updateModalEmail(data.email);
        this.resetView.showModal();
    }
});


Ibles.views.Reset = Ibles.views.BaseAuth.extend({
    initialize: function(options) {
        var $form = $('.auth-form.reset-form')
        _.bindAll(this, 'submitReset', 'submitResetSuccess');
        this.options = options;
        this.registerSubmitHandler($form, this.submitReset);
        this.registerVisibleHandler($form);
    },

    showModal: function() {
        $('.auth-reset-modal:not(.inline)').modal('show');
    },

    updateModalEmail: function(email) {
        $('.auth-reset-modal:not(.inline)').find('input[name="screenName"]').val(email);
    },
    
    submitReset: function(form) {
        var $form = $(form),
            self = this;
        this.resetAction($form, this.submitResetSuccess, function(errorMsg) {
            self.renderAuthError($form, errorMsg);
        });        
    },

    submitResetSuccess: function() {
        this.postAuthRedirect(this.options);
    }
});


Ibles.AuthFlow = Ibles.views.BaseAuth.extend({
    events: {
        'click .login-link': 'showLogin',
        'click .login-required': 'showLogin',
        'click .signup-link': 'showSignup',
        'click .forgot-link': 'showForgot',
        'click .pro-required': 'showPro',
        'click .logout-link': 'logout'
    },

    initialize: function(options) {
        this.options = options;
        // each of these views handle both modal & non-modal versions of their forms,
        // and make it possible to use both versions on the same page
        this.loginView = new Ibles.views.Login(options);
        this.signupView = new Ibles.views.Signup(options);
        this.forgotView = new Ibles.views.Forgot(options);
        sessionReady(function(sessionModel){
            if (sessionModel.authenticated() && !sessionModel.get('emailVerified')
                && $.cookie('verifyHeader') !== 'false'){
                new Ibles.views.EmailVerificationHeader()
            }
        });
    },

    showLogin: function(e) {
        if (!Ibles.session.authenticated()) {
            if (typeof e !== 'undefined')
                e.preventDefault();
            this.hideVisibleModals();
            this.loginView.showModal();
        }
    },
    
    showLoginModal: function(e) {
        this.showLogin(e);  
    },

    checkLoginThen: function(callback){
        var self = this;
        sessionReady(function(sessionModel) {
            if (sessionModel.authenticated()) {
                if (callback){
                    callback();
                }
            } else {
                self.showLogin();
            }            
        });
    },

    showSignup: function(e) {
        if (!this.options.disableModalSignup && !Ibles.session.authenticated()) {
            if (typeof e !== 'undefined')
                e.preventDefault();
            this.hideVisibleModals();
            this.signupView.showModal();
        }
    },

    showForgot: function(e) {
        if (!Ibles.session.authenticated()) {             
            if (typeof e !== 'undefined')
                e.preventDefault();
            this.hideVisibleModals();
            this.forgotView.showModal();
        }          
    },

    showPro: function(e) {
        if (!Ibles.session.isPro() && !Ibles.session.isOld()) {
            if (typeof e !== 'undefined')
                e.preventDefault();
            this.hideVisibleModals();
            $('.auth-gopro-modal:not(.inline)').modal('show');
        }           
    },

    logout: function(e){
        if (typeof e !== 'undefined')
            e.preventDefault();            
        Ibles.session.logout().always(function(){window.location.reload(true);})
    }
});


Ibles.views.RoboCheckView = Backbone.View.extend({
    events: {
        "click .image": "toggleAnswer",
        "click .refresh-btn": "refresh"
    },
    
    initialize: function(opts) {
        this.model = new Ibles.models.RoboCheckModel({name:"choose2of5", imageCount:5});
        this.listenTo(this.model, 'change:robocheckAnswers', this.render);
        this.listenTo(this.model, 'loading', function(){
            this.$('.refresh-btn').addClass('loading');
        });
        this.listenTo(this.model, 'reset', function(){
            this.$('.refresh-btn').removeClass('loading');
        });
        this.model.fetch();
    },
    
    toggleAnswer: function(e) {
        var $image = $(e.currentTarget);
        $image.toggleClass('active');
        this.model.toggleAnswerAtIndex($image.data('value'));
    },
    
    refresh: function(e) {
        this.model.set(this.model.defaults(), {silent: true})
            .fetch();
    },
    
    render: function() {
        var self = this;
        Ibles.fetchTemplate("/static/templates/robocheck.html").done(function(JST){
            self.$el.html(JST["#robocheck_template"](_.extend(self.model.toJSON(), {cacheBuster: new Date().getTime() + $.cookie("JSESSIONID")})));
        });
        return this;
    }
});


Ibles.models.RoboCheckModel = Backbone.Model.extend({    
    defaults: function() {
        return {
            "name": "choose2of5",
            "imageCount": 5,
            "message": "",
            "robocheckAnswers": [],
            "selectedAnswers": []
        }
    },
    
    initalize: function(opts) {
        this.fetch();
    },
    
    fetch: function() {
        var self = this;
        this.trigger("loading");
        Ibles.API.getRequest('getRobocheck', {
            name: this.get("name"),
            locale: Ibles.pageContext.currentLocale,
            ts: (new Date()).getTime().toString() //needed for cache busting          
        }, {
            success: function(data) {
                self.set(data);
            },
            complete: function(){
                self.trigger("reset");
            } 
        });
    },
    
    toggleAnswerAtIndex: function(i) {
        var selectedAnswers = this.get("selectedAnswers");
        if (!selectedAnswers.length) {
            selectedAnswers.push(i);
        } else {
            var index = _.indexOf(selectedAnswers, i);
            if (index >= 0) {
                selectedAnswers.splice(index, 1);
            } else {
                selectedAnswers.push(i);
            }
        }
        this.set("selectedAnswers", selectedAnswers);
    }    
});
})(jQuery)
