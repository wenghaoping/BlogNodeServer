var clone = require('clone');
var MarkdownIt = require('markdown-it');
var markdown = new MarkdownIt({html: true});
var xss = require('xss');
var whiteList = clone(xss.whiteList);
whiteList.embed = ['src', 'type', 'width', 'height'];
var filterXSS = new xss.FilterXSS({
  whiteList: whiteList
});


exports.markdown = function (content) {
  return markdown.render(content || '');
};

exports.xss = function (html) {
  return filterXSS.process(html || '');
};

exports.noHTMLTag = function (html) {
  return xss(html, {
    whiteList:          {br: [], div: [], p: []},  // 白名单为空，表示过滤所有标签
    stripIgnoreTag:     true,      // 过滤所有非白名单标签的HTML
    stripIgnoreTagBody: ['script'] // script标签较特殊，需要过滤标签中间的内容
  });
};
