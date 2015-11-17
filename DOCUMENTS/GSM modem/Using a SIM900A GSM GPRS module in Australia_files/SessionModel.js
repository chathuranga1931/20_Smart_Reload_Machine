(function($) {

Ibles.package("Ibles.models");
	
Ibles.models.SessionModel = Backbone.Model.extend({
    defaults : {     
        logged_in: false, 
        id: null,
        screenName: null,
        locale: null,
        pro: null,
        staff: null,
        admin: false,
        role: null,
        instructablesCount: null,
        draftsCount: null,
        publishedCollectionsCount: null,
        draftCollectionsCount: null,
        authy: null,
        email: null,
        emailVerified:true,
        tinyUrl: "/static/defaultIMG/user.TINY.gif"
    },

    initialize: function() {
        // This is to cover a corner-case where a user can have an authy cookie from one account
        // but an ibleuser cookie from another. If the authy cookie has been deleted, then we
        // delete the ibleuser cookie. If the two cookies don't match, then we reset the ibleuser cookie.
        var self = this;
        
        if (!this.hasAuthyCookie()) {
            this.removeIbleUserCookie();
            this.resolveSessionReady();       
        } else {
            if (!this.isAuthyCookieMatching())
                this.removeIbleUserCookie();
            this.loadUserByAuthyCookie();                        
        }
        this.on('change', this.serializeToCookie);
        this.on('change:logged_in', function(){
            self.setProUserCookie();
            self.setAdminUserCookie();
        });
    },

    getCookieAttributes: function() {
        return _.omit(this.attributes, ["logged_in"]);  
    },

    updateModel: function(data) {
        if (this.hasAuthyCookie()) {
            data['authy'] = $.cookie('authy');
        }
        else {
            data['authy'] = null;
        }
        this.set(_.pick(data, _.keys(this.attributes)));
    },

    serializeToCookie: function() {
        $.cookie('ibleuser', JSON.stringify(this.getCookieAttributes()), {path: '/'});
    },

    cookieHasMissingUserInfo: function(ibleUserCookie) {
        var cookieAttributes = this.getCookieAttributes();
        var ibleUser = JSON.parse(ibleUserCookie);            
        for (var key in cookieAttributes) {
            if (typeof ibleUser[key] === "undefined"){
                return true;
            }
        }
        // if pro variable set in pageContext but not in ibleuser cookie,
        // return true to that cookie gets recreated from whoAmI/showAuthor api request
        if (window.Ibles.pageContext.pro && !ibleUser['pro'])
            return true;
            
        return false;
    },    

    removeCookies: function() {
        $.removeCookie('authy',{ path: '/' });
        $.removeCookie('ibleuser',{ path: '/' });
    },

    setProUserCookie: function() {
        var proUserCookie = $.cookie('proUser');
        if (this.get('pro') && !proUserCookie) {
            $.cookie('proUser', 'true', {path: '/'});
        } else if (proUserCookie) {
            $.removeCookie('proUser', {path: '/'});
        }        
    },
    
    setAdminUserCookie: function() {
        var adminUserCookie = $.cookie('adminUser');
        if (this.isAdmin() && !adminUserCookie) {
            $.cookie('adminUser', 'true', {path: '/'});
        } else if (adminUserCookie) {
            $.removeCookie('adminUser', {path: '/'});
        }        
    },    

    authenticated: function() {
        return this.get("logged_in");
    },

    isAdmin: function() {
        return this.authenticated() && (this.get('admin') || this.get('role') === "ADMIN");
    },

    isStaff: function() {
        return this.authenticated() && (this.get('staff') || this.get('role') === "STAFF");
    },

    isPro: function() {
        return this.authenticated() && this.get('pro');
    },
    
    isOld: function() {
        return this.authenticated() && this.get('role') === "OLD";
    },

    hasAuthyCookie: function() {
        return !_.isUndefined($.cookie('authy'));
    },

    isAuthyCookieMatching: function() {
        var ibleUserCookie = $.cookie('ibleuser');
        return !_.isUndefined(ibleUserCookie) && (JSON.parse(ibleUserCookie)['authy'] === $.cookie('authy'));
    },

    removeIbleUserCookie: function() {
        $.removeCookie('ibleuser', { path: '/' });
    },

    loadUserByAuthyCookie: function() {
        var authyCookie = $.cookie('authy'),
            self = this;            
        if (authyCookie) {
            this.loadUser(function(){
                self.set({logged_in : true});                              
                self.resolveSessionReady();
            });
            return true;
        }
        this.resolveSessionReady();
        return false;
    },

    loadUser: function(cb) {
        var ibleUser = $.cookie('ibleuser');    
        if (!ibleUser || this.cookieHasMissingUserInfo(ibleUser)) {
            this.loadRemainingUserData(cb);
        } else {
            this.updateModel(JSON.parse(ibleUser));
            if (cb) cb();
        } 
    },

    resolveSessionReady: function() {
        Ibles.sessionReady.resolve(this);          
    },

    login: function(opts, callbacks){
        var self = this;
        this.removeCookies();
        return Ibles.API.postRequest("login", opts, {
            success: function(data) {
                self.updateModel(data);
                self.loadRemainingUserData(function(){
                    self.set({logged_in: true});
                    var successCallback = callbacks.success;
                    if (successCallback) successCallback(data);                    
                });
            }, 
            error: function(data) {
                self.set(self.defaults);
                var errorCallback = callbacks.error;
                if (errorCallback) errorCallback(data);                
            },
            complete: function(data) {
                var completeCallback = callbacks.complete;
                if (completeCallback) completeCallback(data);                
            }
        });
    },

    register: function(opts, callback){
        this.removeCookies();
        return Ibles.API.postRequest("robocheckRegister", opts, callback);
    },

    forgotPassword: function(opts, callback){
        return Ibles.API.postRequest("forgotPassword", opts, callback);
    },

    logout: function(){  
        this.removeCookies();
        this.set(this.defaults);
        return Ibles.API.postRequest("logout");
    },

    resetPassword: function(opts, callback){
        this.removeCookies();
        return Ibles.API.postRequest("resetPassword", opts, callback);
    },

    whoAmI : function() {
        var self = this;
        return Ibles.API.getRequest("whoAmI", {},
            {
                success: function(data){
                    self.updateModel(data);
                }
            }
        );
    },

    loadFullAuthor: function() {
        var self = this;
        return Ibles.API.getRequest("showAuthor", {lite: "true"},
            {
                success: function(data){
                    self.updateModel(data);
                }
            }
        );
    },

    loadRemainingUserData : function(cb) {
        var self = this;
        this.whoAmI().done(function(){
            self.loadFullAuthor().done(function(){
                if (cb) cb();
            })
        });
    }    
});
})(window.jQuery);
