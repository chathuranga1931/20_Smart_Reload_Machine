Ibles.package("Ibles.views","Ibles.models");

(function($){

Ibles.models.AlertModel = Backbone.Model.extend({
    defaults: {
        "alertTitle": "",
        "alertMessage": "",
        "alertType": "info"
    },
    types: ["error", "info", "warning", "success"],
    initialize: function(){
        var alertType = this.get('alertType');
        if (_.contains(this.types, alertType)) {
            this.set({alertType: 'alert-' + this.get('alertType')});
        }
    }
});

Ibles.views.AlertView = Backbone.View.extend({
    model: null,
    tagName: "div",
    
    initialize: function(){
        this.render();
    },
    events: {
        "click .close": "closeAlert"
    },
    closeAlert: function(){
        var that = this;
        $('#alertWrapper').fadeOut(200,function(){
            that.remove();
        });
    },
    render: function(){
        var container = $('#alertWrapper'),
            self = this;
        Ibles.fetchTemplate("/static/templates/alerts.html").done(function(JST){
            self.$el.html(JST["#template_error_alert"](self.model.toJSON()));
            container.empty().append(self.$el);
            container.fadeIn(200);
        });
    }
});


Ibles.views.AlertView.callbackFactory = function(type) {
    return function(data) {
        var alertMessage = "";      
        if (data && data.responseJSON)
            data = data.responseJSON;
                    
        if (type === "error") {
            alertMessage = Ibles.toLocaleError(data, Ibles.locale.errors.somethingWentWrong);      
        } else if (type === "success") {  
            alertMessage = Ibles.toLocaleSuccess(data, Ibles.locale.success.genericSuccess);
        }
        
        new Ibles.views.AlertView({
            model: new Ibles.models.AlertModel({
                alertType: type,
                alertMessage: alertMessage
            })
        });        
    }
};
})(window.jQuery);