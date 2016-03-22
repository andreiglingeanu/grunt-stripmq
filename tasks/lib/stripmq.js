'use strict';

var parse = require('css-parse'),
    stringify = require('css-stringify'),
    mediaQuery = require('css-mediaquery');

function transformMediaQueries (ast, options) {
   ast.stylesheet.rules = ast.stylesheet.rules.reduce(function (rules, rule) {
        if (rule.type === 'media') {
            return rules.concat(getNestedRules(rule));
        }

        if (rule.selectors && rule.selectors[0] == '@font-face') {
            return rules.concat([rule]);
        }

        if (rule.selectors) {
            return rules.concat([applyPrefix(rule)]);
        }

        return rules.concat([rule]);
    }, []);
    return ast;
}

function applyPrefix (rule) {
    rule.selectors = rule.selectors.map(function (selector) {
        return ':root:root:root:root .ct-shortcode-preview-modal ' + selector;
    });

    return rule;
}

function getNestedRules (mediaRule) {
    if (isMobile(mediaRule.media)) {
        return mediaRule.rules.map(function (rule) {
            rule.selectors = rule.selectors.map(function (selector) {
                return ':root:root:root:root .ct-device-container.ct-mobile ' + selector;
            });

            return rule;
        });
    }

    if (isTablet(mediaRule.media)) {
        return mediaRule.rules.map(function (rule) {
            rule.selectors = rule.selectors.map(function (selector) {
                return ':root:root:root:root .ct-device-container.ct-tablet ' + selector;
            });

            return rule;
        });
    }

    return mediaRule.rules.map(function (rule) {
        rule.selectors = rule.selectors.map(function (selector) {
            return '.ct-device-container:not(.ct-tablet):not(.ct-mobile) ' + selector;
        });

        return rule;
    });
}

function isMobile (media) {
    return mediaQuery.match(media, optionsForWidth('33.9rem'));
}

function isTablet (media) {
    return mediaQuery.match(media, optionsForWidth('47.9rem'));
}

function optionsForWidth (width) {
    return {
        type: 'screen',
        width: width || 1024,
        'device-width': width || 1024,
        height: 768,
        'device-height': 768,
        resolution: '1dppx',
        orientation: 'landscape'
    }
}

/**
 * strip media queries
 * @param   {string} input
 * @returns {string} output
 */
function StripMQ(input, options) {

    options = {
        type:            options.type || 'screen',
        width:           options.width || 1024,
        'device-width':  options['device-width'] || options.width || 1024,
        height:          options.height || 768,
        'device-height': options['device-height'] || options.height || 768,
        resolution:      options.resolution || '1dppx',
        orientation:     options.orientation || 'landscape',
        'aspect-ratio':  options['aspect-ratio'] || options.width/options.height || 1024/768,
        color:           options.color || 3
    };

    var tree = parse(input);
    tree = transformMediaQueries(tree, options);
    return stringify(tree, {compress: false});
}

module.exports = StripMQ;
