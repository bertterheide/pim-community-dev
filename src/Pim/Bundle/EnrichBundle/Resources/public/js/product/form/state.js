'use strict';
/**
 * State manager extension
 *
 * @author    Julien Sanchez <julien@akeneo.com>
 * @author    Filips Alpe <filips@akeneo.com>
 * @copyright 2015 Akeneo SAS (http://www.akeneo.com)
 * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'pim/dialog',
        'pim/form',
        'text!pim/template/product/state',
        'oro/navigation',
        'oro/mediator'
    ],
    function (
        $,
        _,
        Backbone,
        Dialog,
        BaseForm,
        template,
        Navigation,
        mediator
    ) {
        return BaseForm.extend({
            className: 'updated-status',
            template: _.template(template),
            state: null,
            linkSelector: 'a[href^="/"]:not(".no-hash")',
            message: _.__('pim_enrich.info.entity.updated'),
            confirmationMessage: _.__(
                'pim_enrich.confirmation.discard_changes',
                {
                    'entity': _.__('pim_enrich.entity.product.title')
                }
            ),
            confirmationTitle: _.__('pim_enrich.confirmation.leave'),
            configure: function () {
                _.bindAll(this, 'render', 'unbindEvents', 'linkClicked', 'beforeUnload');

                this.listenTo(this.getRoot().model, 'all', this.collectState);
                this.listenTo(this.getRoot().model, 'all', this.render);
                this.listenTo(mediator, 'entity:form:edit:update_state', this.render);

                mediator.on('product:action:post_update', _.bind(function (data) {
                    this.state = JSON.stringify(data);
                    this.render();
                }, this));

                Backbone.Router.prototype.on('route', this.unbindEvents);

                return BaseForm.prototype.configure.apply(this, arguments);
            },
            bindEvents: function () {
                $(window).on('beforeunload', this.beforeUnload);
                $(this.linkSelector).off('click').on('click', this.linkClicked);
            },
            unbindEvents: function () {
                $(window).off('beforeunload', this.beforeUnload);
                $(this.linkSelector).off('click', this.linkClicked);
            },
            render: function () {
                this.collectState();
                this.$el.html(
                    this.template({
                        message: this.message
                    })
                ).css('opacity', this.hasModelChanged() ? 1 : 0);

                this.getRoot().$el.one('change', this.render);

                return this;
            },
            collectState: function () {
                if (null === this.state || undefined === this.state) {
                    this.state = JSON.stringify(this.getRoot().model.toJSON());
                    this.bindEvents();
                    this.stopListening(this.getRoot().model, 'all', this.collectState);
                }
            },
            beforeUnload: function () {
                if (this.hasModelChanged()) {
                    return this.confirmationMessage;
                }
            },
            linkClicked: function (event) {
                event.stopImmediatePropagation();
                event.preventDefault();

                var doAction = function () {
                    Navigation.getInstance().setLocation($(event.currentTarget).attr('href'));
                };

                if (this.hasModelChanged()) {
                    Dialog.confirm(this.confirmationMessage, this.confirmationTitle, doAction);
                } else {
                    doAction();
                }

                return false;
            },
            hasModelChanged: function () {
                return this.state !== JSON.stringify(this.getRoot().model.toJSON());
            }
        });
    }
);