'use strict';

const urlModule = require('url');

const Microformats = require('microformat-node');

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
      microformatsVersion: Microformats.version,
      mf2Version: Microformats.livingStandard
    }));
};

const extractHrefs = function ($, data) {
  // TODO: Extract from mf2 data instead – first extract a feed than links for each feed item?
  data.hrefs = [];

  var links = $('a');
  var hrefs = {};
  var i;
  var length;
  var href;

  for (i = 0, length = links.length; i < length; i += 1) {
    href = links.eq(i).attr('href');
    try {
      if (href) {
        hrefs[urlModule.resolve(data.baseUrl, href)] = true;
      }
    } catch (e) {}
  }

  for (i in hrefs) {
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
  extractHrefs
};
