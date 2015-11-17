window.Ibles = window.Ibles || {};

(function($){
	
window.Ibles = _.extend(window.Ibles, {
    namespaces: {},
    initialPageContextKeys: [],
    JST: {},

    init: function(context) {
        this.initialContextKeys = _.keys(context);
        _.extend(Ibles.pageContext, context);  
    },
    
    resetPageContext: function() {
        Ibles.pageContext = _.pick(Ibles.pageContext, this.initialPageContextKeys);
    },
    
    package: function() {
        var namespaces = arguments;
        for (var i = 0; i < namespaces.length; i++) {
            var ns = namespaces[i].trim();
            if (!this.namespaces[ns]) {
                this.exportPath(ns);   
                this.namespaces[ns] = true;                             
            }
        }
    },
    
    exportPath : function(namespace) {
        var nsparts = namespace.split(".");
        var parent = window.Ibles;
        if (nsparts[0] === "Ibles") {
            nsparts = nsparts.slice(1);
        }
        for (var i = 0; i < nsparts.length; i++) {
            var partname = nsparts[i];
            if (typeof parent[partname] === "undefined") {
                parent[partname] = {};
            }
            parent = parent[partname];
        }    
    },
    
    attemptTranslationOfString: Ibles.T = function(translateString){
        if (Ibles.locale.messages[translateString] != undefined) {
            return Ibles.locale.messages[translateString];
        }
        if (Ibles.locale.iblesAPIResponses[translateString] != undefined) {
            return Ibles.locale.iblesAPIResponses[translateString];
        }
        return translateString;
    },

    toLocaleError: function(json, defaultMessage){
        var errorMessage;
        if (json && json['error'] && typeof json['error'] !== 'function') {
            errorMessage = Ibles.attemptTranslationOfString(json['error']);
        } else {
            errorMessage = defaultMessage;
        }
        return errorMessage;
    },

    toLocaleSuccess: function(json, defaultMessage){
        var successMessage;
        if (json && json['message']){
            successMessage = Ibles.attemptTranslationOfString(json['message']);
        } else {
            successMessage = defaultMessage;
        }
        return successMessage;
    },
    
    getQueryStringParam: function(name) {
        return Ibles.getUrlParam(window.location.search, name);
    },
    
    getUrlParam: function(url, name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(url);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },    

    updateQueryParameter: function(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i"),
            separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            return uri + separator + key + "=" + value;
        }
    },
        
    templateCache: function(selector) {
        var JST = window.Ibles.JST = window.Ibles.JST || {},
            template = JST[selector];
        if (!template) {
            template = $(selector).html();
            template = _.template(template);
            JST[selector] = template;
        }
        return template;
    },

    addUiTranslations: function (dictionary) {
        dictionary.trans = Ibles.locale.uiElements;
        return dictionary
    },

    toTitle:function(str){
        return str.replace(/\b\w+/g,
            function(s){
                return s.charAt(0).toLocaleUpperCase() + s.substr(1).toLocaleLowerCase();
            });
    },
    
    fetchTemplate: function(path, callback) {  
        var JST = window.Ibles.JST = window.Ibles.JST || {},
            deferred, promise;
            
        if (JST[path]) {
            promise = JST[path];
            promise.done(callback);
            return promise;
        }
        
        deferred = new $.Deferred();
        promise = JST[path] = deferred.promise();
        promise.done(callback);
        
        $.ajax({
            url: path,
            type: "get",
            dataType: "text",
            global: false,
            success: function(contents) {
                var scripts = $(contents).filter('script[type="text/template"]');
                _.each(scripts, function(script) {
                    var script = $(script);
                    JST['#' + script.attr('id')] = _.template(script.html());
                });
                if (_.isFunction(callback)) {
                    promise.done(callback);
                }
                deferred.resolve(JST);
            }
        });
        return promise;
    },
    
    fetchAndAppendTemplate: function(path, $container) {
        var JST = window.Ibles.JST = window.Ibles.JST || {},
            deferred, promise;
        if (JST[path]) {
            promise = JST[path];
            return promise;
        }
        deferred = new $.Deferred();
        promise = JST[path] = deferred.promise();
        $.ajax({
            url: path,
            type: "get",
            dataType: "text",
            global: false,
            success: function(contents) {
                $container.append(contents);
                deferred.resolve();
            }
        });
        return promise
    }       
});
})(window.jQuery);