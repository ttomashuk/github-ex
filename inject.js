(function(){
  var GITHUB_API_URL = 'https://api.github.com/repos/';

  var utils = {
    getContentPath: function () {
      var str = window.location.href;
      var result = str.match(/.*[bt][lr][oe][be]\/[^//]+\/(.*)/);
      return result && result.length && result[1];
    },
    getUsernameWithReponameFromGithubURL: function () {
      var pathnames = window.location.pathname.split('/');
      var user = pathnames[1];
      var repo = pathnames[2]

      return {
        user: user,
        repo: repo
      };
    },
    getUserRepo: function(){
      var path = utils.getUsernameWithReponameFromGithubURL();
      if (!path.user || !path.repo) { return ""; }
      return path.user + '/' + path.repo;;
    }
  };

  var apiUtils = {
    checkStatus: function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }
      throw Error(`GitHub returned a bad status: ${response.status}.`);
    },
    parseJSON: function (response) {
      return response === null ? null : response.json();
    },
    getRepoAssignees: function (callback) {
      var contentParams = '?page=1&per_page=1000';
      window.fetch(GITHUB_API_URL + utils.getUserRepo()+ "/assignees" + contentParams)
        .then(apiUtils.checkStatus)
        .then(apiUtils.parseJSON)
        .then(function (data) {
          callback(data === null ? null : data);
        }).catch(function (error) {
          if (error) {}
          callback(null);
      });
    }
  };

  var domUtils = {
    addAssigneesSection: function () {
      apiUtils.getRepoAssignees(data => {
          $(".pagehead-actions").append('<li><div class="js-social-container">'
              +'<button type="submit" class="btn btn-sm btn-with-count">Assignees</button>'
              +'<a href="/'+utils.getUserRepo()+'/issues" '
              +'class="social-count" aria-label="7164 users forked this repository">'+data.length+'</a></div></li> ')
        },
        utils.getContentPath()
      );
    }
  };

  window.chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
      if (document.readyState === 'complete') {
        clearInterval(readyStateCheckInterval)
        domUtils.addAssigneesSection();
      }
    }, 10)
  });

}());
