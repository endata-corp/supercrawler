var cheerio = require("cheerio"),
  urlMod = require("url");

function matches(opts, absoluteTargetUrl) {
  let matched = false;
  // opts.patterns.push('robots.txt');
  opts.patterns.forEach((pattern) => {
    if (absoluteTargetUrl.includes(pattern)) {
      // console.log(`>> ${absoluteTargetUrl} matched ${pattern}`);
      matched = true;
    }
  });
  return matched;
}

module.exports = function (opts) {
  if (!opts) {
    opts = {};
  }

  return function (context) {
    var $;

    $ = context.$ || cheerio.load(context.body);
    context.$ = $;

    return $("a[href], link[href][rel=alternate]").map(function () {
      var $this,
        targetHref,
        absoluteTargetUrl,
        urlObj,
        protocol,
        hostname;

      $this = $(this);
      targetHref = $this.attr("href");
      absoluteTargetUrl = urlMod.resolve(context.url, targetHref);
      urlObj = urlMod.parse(absoluteTargetUrl);
      protocol = urlObj.protocol;
      hostname = urlObj.hostname;

      if (protocol !== "http:" && protocol !== "https:") {
        return null;
      }

      // Restrict links to a particular group of hostnames.
      if (typeof opts.hostnames !== "undefined") {
        if (opts.hostnames.indexOf(hostname) === -1) {
          return null;
        }
      }

      if (!matches(opts, absoluteTargetUrl)) {
        return null;
      }

      return urlMod.format({
        protocol: urlObj.protocol,
        auth: urlObj.auth,
        host: urlObj.host,
        pathname: urlObj.pathname,
        search: urlObj.search
      });
    }).get();
  };
};
