'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

describe('MetaDataParserMf2', function () {
  const MetaDataParser = require('metadataparser').MetaDataParser;
  const MetaDataParserMf2 = require('../.');

  let parser, sourceUrl;

  // Taken from the h-entry Microformats wiki page
  const exampleHtml = '<article class="h-entry">' +
    '  <h1 class="p-name"><a class="u-url" href="http://example.net/abc">Microformats are amazing</a></h1>' +
    '  <p>Published by <a class="p-author h-card" href="http://example.com">W. Developer</a>' +
    '     on <time class="dt-published" datetime="2013-06-13 12:00:00">13<sup>th</sup> June 2013</time>' +
    '  <p class="p-summary">In which I extoll the virtues of using microformats.</p>' +
    '  <div class="e-content">' +
    '    <p><a href="http://example.org/bar">Blah</a> blah blah</p>' +
    '  </div>' +
    '</article>';

  beforeEach(function () {
    sourceUrl = 'http://example.com/foo';

    parser = new MetaDataParser();

    MetaDataParserMf2.addToParser(parser);
  });

  describe('extract', function () {
    it('should parse the microformats data', function () {
      return parser.extract(sourceUrl, exampleHtml)
        .should.eventually.be.an('object')
        .that.has.property('microformats')
        .that.contain.keys('items', 'rels')
        .and.has.deep.property('items[0].properties')
          .that.is.an('object')
          .that.contain.keys('author', 'name', 'published', 'summary')
          .that.have.deep.property('author[0].properties.name[0]', 'W. Developer');
    });
  });
});
