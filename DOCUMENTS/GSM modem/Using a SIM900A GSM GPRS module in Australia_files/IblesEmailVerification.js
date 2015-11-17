(function($){

Ibles.package("Ibles.views");

Ibles.views.EmailVerificationHeader =  Backbone.View.extend({
    className:'sticky-email-verification',
    events:{
        'click .send-verification':'showVerificationModal'
    },
    initialize:function(){
        this.render();
        this.verificationModal = new Ibles.views.EmailVerificationModal();
    },
    showVerificationModal:function(e){
        e.preventDefault();
        this.verificationModal.$el.modal('show');
    },
    render:function(){
        var that = this;
        return Ibles.fetchTemplate("/static/templates/verify_email_templates.html").done(function(JST){
            that.$el.html(JST['#verify-header-template'](Ibles.session.toJSON()));
            that.$el.insertBefore('#gbl-header');
        });
        return this;
    }
})

Ibles.views.EmailVerificationModal = Backbone.View.extend({
    className:'modal fade verification-modal',
    events:{
        'click .send-email':'verify'
    },
    initialize:function(){
        this.render()
    },
    render:function(){
        var that = this;
        return Ibles.fetchTemplate("/static/templates/verify_email_templates.html").done(function(JST){
            that.$el.html(JST['#verify-email-modal-template'](Ibles.session.toJSON()));
            that.$el.insertAfter('.sticky-email-verification');
        });
        return this;
    },
    verify:function(e){
        e.preventDefault();
        this.$('.send-email').button('loading');
        var promise,
            that = this;
        if (this.$('.email-input').val() === Ibles.session.get('email')){
            promise = this.sendVerificationEmail();
        } else {
            promise = this.saveProfile();
        }
        promise.then(function(data){
            $.cookie('verifyHeader','false',{path: '/' });
            $('.sticky-email-verification').hide();
            that.$('.send-email').button('finished');
            setTimeout(function(){that.$el.modal('hide');},1000);
        }).fail(function(jqXHR){
            that.$('.send-email').button('reset');
            if (!_.isUndefined(jqXHR.responseJSON) && !_.isUndefined(jqXHR.responseJSON.error)){
                that.$('.send-error').text(jqXHR.responseJSON.error);
            }
            that.$('.send-error').css('display','inline-block');
        })
    },
    saveProfile: function(){
        return Ibles.API.postRequest('saveProfile',{
            email:this.$('.email-input').val()
        })
    },
    sendVerificationEmail: function(){
        return Ibles.API.getRequest('emailVerificationSend')
    }
});
})(jQuery)
