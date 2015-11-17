window.Ibles = window.Ibles || {};

(function($){

    /**
     * Base login provider
     */
    var IbleSocialLoginProvider = function(options) {
        this.init(options);
    };

    IbleSocialLoginProvider.prototype = {
        constructor: IbleSocialLoginProvider,
        name: "",
        manager: null,
        loginSelector: "",
        windowSize: {width: 800, height: 400},        
        
        init: function(options) {
            var self = this;
            this.options = options;
            this.manager = options.manager;            
            $(document).on("click", this.loginSelector, function(e) {
                e.preventDefault();
                self.performOauthLogin();
            });
        },

        performOauthLogin: function() {
            this.manager.setActiveProvider(this);
            this.oauthPreLogin();
        },

        oauthPreLogin: function() {
            $('.social-error-label').hide();
            this.oauthPopup({
                path: this.options.oauthGetAuthUrl + "?" + $.param({
                    "provider": this.name,
                    "callback": this.options.oauthCallbackUrl,
                    "rand" : parseInt(Math.random() * 99999999)
                }),
                oauthCallbackUrl: this.options.oauthCallbackUrl
            });
        },

        oauthPostLogin: function(callbackUrl) {
            var buttons = $(this.loginSelector),
                self = this;
            buttons.each(function(index, button){
                $(button).button('loading');
            });
            $.ajax({
                method: "POST",
                url: '/json-api/loginSocialUser?'+$.param(this.makeLoginJsonApiParams(callbackUrl)),
                success: function(data){
                    self.postAuthRedirect();
                },
                error: function(){
                    $('.social-error-label').text('Something went wrong!').slideDown();
                    $.proxy(self.manager.logout, self.manager);
                },
                complete:function(){
                    buttons.each(function(index, button){
                        $(button).button('reset');
                    })
                }
            });
        },
        
        postAuthRedirect: function() {
            var currentUrl = window.location.href,
                authPaths = this.options.authPaths,
                onAuthPath = false;
                
            for (var i=0; i < authPaths.length; i++) {
                onAuthPath = onAuthPath || (currentUrl.indexOf(authPaths[i]) >= 0);
            }
            
            if (!onAuthPath) {
                window.location.reload(true);
            } else {
                var nextPageValue = this.getUrlParam(currentUrl, this.options.nextPageParameter);
                if (nextPageValue) {
                    window.location = nextPageValue;
                } else {
                    window.location = "/";
                }
            }
        },
        
        makeLoginJsonApiParams: function(url) {
            var oauth_verifier = this.getUrlParam(url, 'oauth_verifier');
            return {
                "verifier": oauth_verifier
            };
        },

        oauthPopup: function(options) {
            if (!options || !options.path) {
                throw new Error("path must be specified in options");
            }
            options = $.extend({
                windowName: 'ConnectWithOAuth',
                windowOptions: 'location=0,status=0,width=' + this.windowSize.width + ',height=' + this.windowSize.height
            }, options);
            window.open(options.path, options.windowName, options.windowOptions);
        },

        getUrlParam: function(url, name) {
            name = name.replace(/[[]/,"\[").replace(/[]]/,"\]");
            var regexS = "[\?&]"+name+"=([^&#]*)";
            var regex = new RegExp( regexS );
            var results = regex.exec( url );
            if( results == null )
                return "";
            else
                return results[1];
        }
    };
    
    
    var IbleFacebookLogin = function(options) {
        this.init(options)
    };

    IbleFacebookLogin.prototype = $.extend({}, IbleSocialLoginProvider.prototype, {
        name: "facebook",
        loginSelector: ".facebook-login, .btn-facebook",
        windowSize: {width: 400, height: 350},        

        makeLoginJsonApiParams: function(url) {
            var code = this.getUrlParam(url, 'code');
            return {
                "verifier": code
            };
        }
    });


    /**
     * Twitter login class
     */
    var IbleTwitterLogin = function(options) {
        this.init(options)
    };

    IbleTwitterLogin.prototype = $.extend({}, IbleSocialLoginProvider.prototype, {
        name: "twitter",
        loginSelector: ".twitter-login, .btn-twitter"
    });


    /**
     * Google plus login class
     */
    var IbleGoogleLogin = function(options) {
        this.init(options)
    };

    IbleGoogleLogin.prototype = $.extend({}, IbleSocialLoginProvider.prototype, {
        name: "google",
        loginSelector: ".google-login, .btn-google",
        windowSize: {width: 500, height: 500},

        makeLoginJsonApiParams: function(url) {
            var oauth_verifier = this.getUrlParam(url, 'code');
            return {
                "verifier": oauth_verifier
            };
        }
    });


    /**
     * Autodesk login class
     */
    var AutodeskLogin = function(options) {
        this.init(options)
    };

    AutodeskLogin.prototype = $.extend({}, IbleSocialLoginProvider.prototype, {
        name: "autodesk",
        loginSelector: ".autodesk-login, .btn-autodesk",

        makeLoginJsonApiParams: function(url) {
            var tokenkey = this.getUrlParam(url, 'tokenkey');
            return {
                "verifier": tokenkey
            };
        }
    });


    /**
     * Login manager
     */
    var IbleSocialLogin = function(options) {
        this.init(options);
    };

    IbleSocialLogin.prototype = {
        constructor: IbleSocialLogin,

        supportedProviders: {
            facebook: IbleFacebookLogin,
            twitter: IbleTwitterLogin,
            google: IbleGoogleLogin,
            autodesk: AutodeskLogin
        },

        loginInstances: [],

        init: function(options) {
            this.options = options;
            var supportedProviders = this.supportedProviders;
            for (var providerName in supportedProviders) {
                var providerInstance = new supportedProviders[providerName]($.extend({manager: this}, options));
                this.loginInstances.push(providerInstance);
            }
        },

        setActiveProvider: function(provider) {
            this.activeProvider = provider;
        },

        getActiveProvider: function() {
            return this.activeProvider;
        },

        logout: function(){
            $.ajax({
                url: '/json-api/logout',
                dataType: 'json',
                type: 'POST'
            })
        }
    };

    window.Ibles.SocialLogin = IbleSocialLogin;    
})(jQuery);
