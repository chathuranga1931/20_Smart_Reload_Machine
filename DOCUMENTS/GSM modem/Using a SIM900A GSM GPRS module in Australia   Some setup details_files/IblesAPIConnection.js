(function($){

Ibles.API = {
    baseURL: "/json-api/",
    
    postRequest: function(method, opts, callbacks, requiredKeys) {
        var self = this;

        var promise = $.ajax({
            url: this.baseURL + method,
            dataType: 'json',
            type: 'POST',
            data: opts || {}
        })
        .done(function(data) {
            if (self.containsRequiredKeys(data, requiredKeys) && !self.hasError()){
               if (callbacks && 'success' in callbacks ) callbacks.success(data);
            }
        })
        .fail(function(jqXHR) {
            if (callbacks && 'error' in callbacks) callbacks.error(jqXHR.responseJSON);
        })
        .always(function(jqXHR){
            if (callbacks && 'complete' in callbacks) callbacks.complete(jqXHR.responseJSON);
        });
        return promise;
    },

    jsonPostRequest: function(method, opts, callbacks, requiredKeys) {
        var self = this;
        var promise = $.ajax({
            url: this.baseURL + method,
            dataType: 'json',
            type: 'POST',
            data: 'json=' + encodeURIComponent(JSON.stringify(opts || {}))
        })
        .done(function(data) {
            if (self.containsRequiredKeys(data, requiredKeys) && !self.hasError()){
               if (callbacks && 'success' in callbacks ) callbacks.success(data);
            }
        })
        .fail(function(jqXHR) {
            if (callbacks && 'error' in callbacks) callbacks.error(jqXHR.responseJSON);
        })
        .always(function(jqXHR){
            if (callbacks && 'complete' in callbacks) callbacks.complete(jqXHR.responseJSON);
        });
        return promise;
    },

    baseAjaxPostRequest:function(baseUrl, method, opts, callbacks){
        var promise = $.ajax({
            url: baseUrl + method + '/',
            type: 'POST',
            data: opts || {}
        })
        .done(function(data) {
            if (callbacks && 'success' in callbacks ) callbacks.success(data);
        })
        .fail(function(jqXHR) {
            if (callbacks && 'error' in callbacks) callbacks.error(jqXHR.responseJSON);
        })
        .always(function(jqXHR){
            if (callbacks && 'complete' in callbacks) callbacks.complete(jqXHR.responseJSON);
        });
        return promise;
    },

    ajaxRequest: function(method, opts, callbacks) {
        return this.baseAjaxPostRequest('/ajax/',method, opts, callbacks);
    },

    contestAjaxRequest: function(method, opts, callbacksDict) {
        return this.baseAjaxPostRequest('/contest/',method, opts, callbacksDict);
    },

    adminAjaxRequest: function(method, opts, callbacksDict) {
        return this.baseAjaxPostRequest('/admin/',method, opts, callbacksDict);
    },

    getRequest: function(method, opts, callbacks, requiredKeys) {
        var opts = opts || {},
            url = this.baseURL + method + '?' + $.param(opts),
            self = this;

        var promise = $.ajax({
            url: url,
            dataType: 'json',
            type: 'GET'
        })
        .done(function(data) {
            if (self.containsRequiredKeys(data, requiredKeys) && !self.hasError()){
               if (callbacks && 'success' in callbacks ) callbacks.success(data);
            }
        })
        .fail(function(jqXHR) {
            if (callbacks && 'error' in callbacks) callbacks.error(jqXHR.responseJSON);
        })
        .always(function(jqXHR){
            if (callbacks && 'complete' in callbacks) callbacks.complete(jqXHR.responseJSON);
        });
        return promise;
    },

    hasError: function(data) {
        var errorMessage = "";
        if (_.isUndefined(data) || (_.isUndefined(data['error']) && _.isUndefined(data['validationErrors']))){
            return false;
        } else {
            if (!_.isUndefined(data['error'])){
                errorMessage = errorMessage + Ibles.attemptTranslationOfString(data.error) + "<br/>";
            }
            if (!_.isUndefined(data['validationErrors'])){
                _.each(data.validationErrors, function(error){
                    errorMessage = errorMessage + Ibles.attemptTranslationOfString(error) + "<br/>";
                })
            }
            this.errorAlert(errorMessage);
            return true;
        }
    },

    containsRequiredKeys: function(data, requiredKeys) {
        var requiredKeys = _.isUndefined(requiredKeys) ? [] : requiredKeys,
            hasKeys;
        //take an array of keys or a single string
        if (typeof requiredKeys === 'string') requiredKeys = [requiredKeys];
        hasKeys =  _.reduce(requiredKeys, function (memo, key){
            return _.has(data, key) && memo;
        }, true);
        if (hasKeys === false) {
            this.errorAlert(Ibles.locale.errors.missingKeys);
        }
        return hasKeys;
    },

    errorAlert:function(errorMessage){
        new Ibles.views.AlertView({
            model: new Ibles.models.AlertModel({
                alertType: "error",
                alertMessage: errorMessage
            })
        });
    }
}
})(window.jQuery);