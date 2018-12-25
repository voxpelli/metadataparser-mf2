'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

describe('MetaDataParserMf2', function () {
  const MetaDataParser = require('@voxpelli/metadataparser').MetaDataParser;
  const MetaDataParserMf2 = require('../.');

  let parser, sourceUrl;

  // Taken from the h-entry Microformats wiki page
  const exampleHtml = '<article class="h-entry">' +
    '  <h1 class="p-name"><a class="u-url" href="/abc">Microformats are amazing</a></h1>' +
    '  <p>Published by <a class="p-author h-card" href="http://example.com">W. Developer</a>' +
    '     on <time class="dt-published" datetime="2013-06-13 12:00:00">13<sup>th</sup> June 2013</time>' +
    '  <p class="p-summary">In which I extoll the virtues of using microformats.</p>' +
    '  <div class="e-content">' +
    '    <p><a href="#bar">Yet</a> another <a>wow</a></p>' +
    '    <p><a href="http://example.org/bar">Blah</a> blah blah</p>' +
    '  </div>' +
    '</article>';

  beforeEach(function () {
    sourceUrl = 'http://example.com/foo';
    parser = MetaDataParserMf2.addToParser(new MetaDataParser());
  });

  describe('extract', function () {
    it('should parse the microformats data', function () {
      return parser.extract(sourceUrl, exampleHtml)
        .should.eventually.be.an('object')
        .that.has.property('microformats')
        .that.contain.keys('items', 'rels')
        .and.has.nested.property('items[0].properties')
        .that.is.an('object')
        .that.contain.keys('author', 'name', 'published', 'summary', 'url')
        .then(props => Promise.all([
          props.should.have.deep.property('url', ['http://example.com/abc']),
          props.should.have.deep.property('published', ['2013-06-13T12:00:00']),
          props.should.have.nested.property('author[0].properties.name[0]', 'W. Developer'),
          props.should.have.deep.property('content', [
            {
              html: '    <p><a href="http://example.com/foo#bar">Yet</a> another <a>wow</a></p>    <p><a href="http://example.org/bar">Blah</a> blah blah</p>  ',
              value: 'Yet another wow    Blah blah blah'
            }
          ])
        ]));
    });
  });
});
