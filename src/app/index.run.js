function runBlock($rootScope, $interval, $window, $timeout, $state, $mdToast, UserService, config, notificationFactory, $log) {
  'ngInject';

  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    angular.element('.main').addClass('hide');
    angular.element('.is-mobile').text('请在电脑上登录使用...');
    return;
  }else{
    angular.element('.is-mobile').addClass('hide');
  }

  $rootScope.$on('bodyVisible', function(delay) {
      angular.element('body').attr('visible', true);
  });

  //文件上传初始化
  AV.initialize(config.appId, config.appKey);

  // 推送初始化
  var push = AV.push({appId: config.appId,appKey: config.appKey});

  // 如果想接收推送，需要调用 open 方法，开启和服务器的连接
  push.open(function() {
      $log.debug('连接服务器成功，可以接收推送');
      $mdToast.show(
        $mdToast.simple()
        .content(`欢迎使用 微配「配件商IM」`)
        .position('top right')
      );
  });

  // 监听推送消息
  push.on('message', function(data) {
      $log.debug(data);

      if (!("Notification" in $window)) {
          $log.debug("This browser does not support desktop notification");
      }

      if($window.Notification && Notification.permission !== 'granted'){
        Notification.requestPermission();
      }

      if (document.body.className === 'hidden') {

          var n = notificationFactory.create("消息通知",{
            icon : 'favicon.ico',
            body: data.body
          });

          n.onclick = function(){
            event.preventDefault();
            n.close();
            // $window.open().close();
            $window.focus();
          };
      }

  });

  // 监听网络异常，SDK 会在底层自动重新连接服务器
  push.on('reuse', function() {
      $log.log('网络中断正在重试...');
      $mdToast.show(
        $mdToast.simple()
        .content(`网络中断正在重试...`)
        .position('top right')
      );
  });

  //============= 判断当前窗口是否打开 ==============
  var hidden = "hidden";
  if (hidden in document)
    document.addEventListener("visibilitychange", onchange);
  else if ((hidden = "mozHidden") in document)
    document.addEventListener("mozvisibilitychange", onchange);
  else if ((hidden = "webkitHidden") in document)
    document.addEventListener("webkitvisibilitychange", onchange);
  else if ((hidden = "msHidden") in document)
    document.addEventListener("msvisibilitychange", onchange);
  // IE 9 and lower:
  else if ("onfocusin" in document)
    document.onfocusin = document.onfocusout = onchange;
  // All others:
  else
    $window.onpageshow = $window.onpagehide
    = $window.onfocus = $window.onblur = onchange;

  function onchange (evt) {
    var v = "visible", h = "hidden",
          evtMap = {
            focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
          };
    evt = evt || $window.event;
    if (evt.type in evtMap) {
       document.body.className = evtMap[evt.type];
    } else{
       document.body.className = this[hidden] ? "hidden" : "visible";
    }
    if (document.body.className === 'visible') {
      $interval.cancel($rootScope.titleInterval);
      document.title = '微配配件商IM';
    }
  }

  // set the initial state (but only if browser supports the Page Visibility API)
  if( document[hidden] !== undefined )
    onchange({type: document[hidden] ? "blur" : "focus"});
  //============= 判断当前窗口是否打开 end ==============

  $rootScope.$on('$stateChangeStart', function(event, next) {
    if (next.name === 'login') {
      if (UserService.isCached()) {
        $state.go('conversation.message');
        return;
      }
      return;
    }
    if (!UserService.isLoggedin()) {
      if (!UserService.isCached()) {
        setTimeout(() => $state.go('login'), 0);
      } else {
        var userInfo = UserService.getCachedInfo();
        UserService.connect(userInfo);
        // UserService.login(userInfo.id, userInfo.email);
      }
    }
  });

}

export default runBlock;
