'use strict';

const { URL } = require('url');

const Microformats = require('microformat-node');

const versions = {
  version: require('./package.json').version,
  microformatsVersion: Microformats.version,
  livingStandard: Microformats.livingStandard
};

const extractMicroformats = function ($, data) {
  return Microformats.getAsync({
    html: $.html(),
    // TODO: Add support for h-feed? h-event? h-item?
    filters: ['h-entry'],
    baseUrl: data.baseUrl,
    dateFormat: 'w3c'
  })
    .then(mfData => Object.assign(data, {
      microformats: mfData,
      microformatsVersion: versions
    }));
};

const extractHrefs = function ($, data) {
  // TODO: Extract from mf2 data instead – first extract a feed than links for each feed item?
  data.hrefs = [];

  const links = $('a');
  const hrefs = {};

  for (let i = 0, length = links.length; i < length; i += 1) {
    const href = links.eq(i).attr('href');
    try {
      if (href) {
        const resolvedUrl = (new URL(href, data.baseUrl)).toString();
        hrefs[resolvedUrl] = true;
      }
    } catch (e) {}
  }

  for (let i in hrefs) {
    data.hrefs.push(i);
  }

  return data;
};

const addToParser = function (parserInstance) {
  parserInstance.removeExtractor('headers');
  parserInstance.addExtractor('microformats', extractMicroformats);
  parserInstance.addExtractor('hrefs', extractHrefs);

  return parserInstance;
};

module.exports = {
  addToParser,
  extractMicroformats,
  extractHrefs,
  versions
};
