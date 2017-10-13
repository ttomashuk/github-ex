(function(){

  var currentState = false;

  function matchUrl(url){
    return url.match("http://github.com*") || url.match("https://github.com*") ;
  }

  function updateIcon(){
    chrome.browserAction.setIcon({path:currentState?'icons/active_128.png':'icons/inactive_128.png'});
  }

  function checkIcon(state){
    if(currentState != state) {
      currentState = state;
      updateIcon();
    }
  }

  function checkCurrentPageUrl(){
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        checkIcon(matchUrl(tabs[0].url));
    });
  }

  chrome.tabs.onActivated.addListener(function(tabId, changeInfo) {
    checkCurrentPageUrl();
  });


  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if (changeInfo.status === 'loading') {
      checkCurrentPageUrl();
    }
  });

}());
