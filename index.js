'use strict';

var MetaDataParser = require('metadataparser').MetaDataParser;
var microformats = require('microformat-node');
var microformatsVersion = require('microformat-node/package.json').version;
var cheerio = require('cheerio');
var urlTools = require('../utils/url-tools');

module.exports = MetaDataParser.extend({
  addDefaultExtractors: function () {
    MetaDataParser.prototype.addDefaultExtractors.call(this);

    this.removeExtractor('headers');
    this.addExtractor('microformats', this.extractMicroformats);
    this.addExtractor('hrefs', this.extractHrefs);
  },
  extractMicroformats: function ($, data) {
    return new Promise(function (resolve, reject) {
      var $mf = cheerio.load($.html());

      microformats.parseDom($mf, $mf.root(), {
        filters: ['h-entry'],
        logLevel: 0,
        baseUrl: data.baseUrl
      }, function (err, mfData) {
        if (err) { return reject(err); }

        data.microformats = mfData;
        data.microformatsVersion = microformatsVersion;

        resolve(data);
      });
    });
  },
  extractHrefs: function ($, data) {
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
          hrefs[urlTools.normalizeUrl(href, { relativeTo: data.baseUrl })] = true;
        }
      } catch (e) {}
    }

    for (i in hrefs) {
      data.hrefs.push(i);
    }

    return data;
  }
});
