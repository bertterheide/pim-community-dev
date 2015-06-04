'use strict';

define([
        'jquery',
        'underscore',
        'pim/entity-manager'
    ], function (
        $,
        _,
        EntityManager
    ) {
        return {
            getAttributesForProduct: function (product) {
                return EntityManager.getRepository('family').findAll().then(function (families) {
                    return !product.family ?
                        _.keys(product.values) :
                        _.union(_.keys(product.values), families[product.family].attributes);
                });
            },
            getOptionalAttributes: function (product) {
                return $.when(
                    EntityManager.getRepository('attribute').findAll(),
                    this.getAttributesForProduct(product)
                ).then(function (attributes, productAttributes) {
                    var optionalAttributes = _.map(
                        _.difference(_.pluck(attributes, 'code'), productAttributes),
                        function (attributeCode) {
                            return _.findWhere(attributes, {code: attributeCode});
                        }
                    );
                    return optionalAttributes;
                });
            },
            isOptional: function (attribute, product, families) {
                return !product.family ? true : !_.contains(families[product.family].attributes, attribute);
            },
            getEmptyValue: function (attribute) {
                switch (attribute.type) {
                    case 'pim_catalog_date':
                    case 'pim_catalog_file':
                    case 'pim_catalog_image':
                    case 'pim_catalog_simpleselect':
                    case 'pim_reference_data_simpleselect':
                    case 'pim_catalog_identifier':
                    case 'pim_catalog_number':
                        return null;
                    case 'pim_catalog_metric':
                        return {
                            'data': null,
                            'unit': attribute.default_metric_unit
                        };
                    case 'pim_catalog_multiselect':
                    case 'pim_reference_data_multiselect':
                        return [];
                    case 'pim_catalog_text':
                    case 'pim_catalog_textarea':
                        return '';
                    case 'pim_catalog_boolean':
                        return false;
                    case 'pim_catalog_price_collection':
                        return [];
                    default:
                        throw new Error(JSON.stringify(attribute));
                }
            },
            getValue: function (values, attribute, locale, scope) {
                //Should be splitted in two methods
                locale = attribute.localizable ? locale : null;
                scope  = attribute.scopable ? scope : null;

                var result = _.findWhere(values, {scope: scope, locale: locale});

                if (!result) {
                    result = {
                        'scope':  scope,
                        'locale': locale,
                        'value':  this.getEmptyValue(attribute)
                    };
                }

                return result;
            },
            generateValues: function (values, attribute, locales, channels) {
                _.each(locales, _.bind(function (locale) {
                    _.each(channels, _.bind(function (channel) {
                        var newValue = this.getValue(
                            values,
                            attribute,
                            locale.code,
                            channel.code
                        );

                        if (!_.findWhere(
                            values,
                            {scope: newValue.scope, locale: newValue.locale}
                        )) {
                            values.push(newValue);
                        }
                    }, this));
                }, this));

                return values;
            },
            generateMissingPrices: function (values, attribute, currencies) {
                if ('pim_catalog_price_collection' === attribute.type) {
                    _.each(values, function (value) {
                        var prices = [];
                        _.each(currencies, function (currency) {
                            var price = _.findWhere(value.value, {currency: currency.code});

                            if (!price) {
                                price = {data: null, currency: currency.code};
                            }

                            prices.push(price);
                        });

                        value.value = prices;
                    });
                }

                return values;
            }
        };
    }
);