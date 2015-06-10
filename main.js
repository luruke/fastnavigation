//Proof of concept for fast navigation..!
//todo, cross browser, localcache expiring...
//promise + localstorage

var currentRequests = {};

var cache = {
  get: function(key) {
    return localStorage.getItem(key) || false;
  },
  set: function(key, value) {
    localStorage.setItem(key, value);
  }
};

function loadRequest(url) {

  if (currentRequests[url]) {
    //There is already a promise going on for solve this url
    return currentRequests[url];
  }

  var promise = new Promise(function(resolve, reject) {
    var alreadySaved = cache.get(url);

    if (alreadySaved.length)
      return resolve(alreadySaved);

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState === 4 && req.status === 200) {
        cache.set(url, req.responseText);
        resolve(req.responseText);
        delete currentRequests[url];
      }
    };

    req.open('GET', url);
    req.send();
  });

  currentRequests[url] = promise;
  return promise;
};

function onLinkClick(e) {
  e.preventDefault();

  var href = e.currentTarget.href;
  loadRequest(href).then(function(html) {
    changePage(href, html);
  });
};

function onLinkHover(e) {
  loadRequest(e.currentTarget.href);
};

function changePage(url, html) {
  history.pushState({}, null, url);

  document.open();
  document.write(html);
  document.close();
};

var links = document.querySelectorAll('a');

for (var i = links.length; i--;) {
  links[i].addEventListener('mouseenter', onLinkHover);
  links[i].addEventListener('click', onLinkClick);
}
