'use strict';

/**
 * citation service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::citation.citation');
