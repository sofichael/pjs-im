class ConversationController {
  constructor($scope, $compile, $mdSidenav, $state, $mdToast, $timeout, $interval, $window, $log, $rootScope, EMOJIREG, rt, UserService, conversationCache, notificationFactory, config) {
    'ngInject';

    this.$scope = $scope;
    this.$rootScope = this.$rootScope;
    this.$compile = $compile;
    this.$mdSidenav = $mdSidenav;
    this.userService = UserService;
    this.$window = $window;
    this.$state = $state;
    this.$log = $log;
    this.$timeout = $timeout;
    this.$interval = $interval;
    this.$rootScope = $rootScope;

    this.conversationCache = conversationCache;
    this.notificationFactory = notificationFactory;

    this.config = config;
    this.EMOJIREG = EMOJIREG;
    this.tabSelectedIndex = 0;

    this.uuids = [];
    this.conversations = [];
    this.contactList = this.loadContact();
    this.getUserListDone = false;
    this.getContactListDone = false;

    this.isMenuOpen = undefined;


    // 获取对话列表
    rt.getMyConvs().then((convs) => {
      $log.debug(convs);
      this.conversations = convs;

      // 每次重新连接都需要加入一次暂态的默认会话
      // var joinDefaultConversationPromise = rt.conv(config.defaultConversation);
      // if (convs.length === 0) {
      //   // 首次使用提示
      //   joinDefaultConversationPromise.then(
      //     (conv) => $mdToast.show(
      //       $mdToast.simple()
      //       .content(`欢迎使用 LeanMessage，自动加入默认群聊「${conv.name}」`)
      //       .position('top right')
      //     )
      //   );
      // }
      // joinDefaultConversationPromise.then(
      //   (conv) => {this.conversations.push(conv);}
      // );

      // 如果用户没有添加 微配小秘 系统会话，则添加之
      if (!convs.some((conv) => {conv.id === config.sysConversation;})) {
        $log.debug('系统消息 微配小秘 加入.');
        rt.conv(config.sysConversation).then(
          (conv) => this.conversations.unshift(conv)
        );
      }

      //根据uuid获取用户详细信息
      this.uuids = this.getUUIDByConvs(this.conversations);
      this.getUserListByUUIDs(this.uuids);

      //获取在线用户
      rt.ping(this.uuids).then((list) => {
        this.handleOnLine(list);
      });
    });

    //更新在线用户
    $interval(()=>{
      rt.ping(this.uuids).then((list) => {
        $log.debug(list);
        this.handleOnLineInterval(list);
      });
    },1000*60*5);

    // 监听消息
    rt.on('message', (message) => {
      $log.debug(message);

      if (message.msg.typing) {
        return false;
      }else{
          //是否消息通知
          this.notification(message);
      }

      // 某个对话收到消息后更新该对话的 lastMessageTime 字段
      let conv = this.findFirstMatch(
        this.conversations,
        conv => conv.id === message.cid
      );

      if (conv) {
        // 刷新页面有消息时缓存对话信息
        this.cacheMessage(message,conv);

        if (typeof this.currentConversation === 'undefined' || conv.id !== this.currentConversation.id) {
          if (typeof conv.unreadMessagesCount !== 'number') {
            conv.unreadMessagesCount = 0;
          }
          conv.unreadMessagesCount++;
          if (conv.unreadMessagesCount > 99) {
            conv.unreadMessagesCount = '...';
          }
        }

        //接收信息显示最新一条内容信息
        conv.onLine = true;
        if (message.content.type === -1 && message.content.attr && message.content.attr.type !== 15) {
            conv.lastMessage = this.transferEmoji(message);
        }else{
            conv.lastMessage = message;
        }

        conv.lastMessageTime = Date.now();
      } else if(!message.msg.typing){
        var joinDefaultConversationPromise = rt.conv(message.cid);
        joinDefaultConversationPromise.then(
          (conv) => {
            if (typeof conv.unreadMessagesCount !== 'number') {
              conv.unreadMessagesCount = 0;
            }
            conv.unreadMessagesCount++;
            if (conv.unreadMessagesCount > 99) {
              conv.unreadMessagesCount = '...';
            }
          }
        );
        joinDefaultConversationPromise.then(
          (conv) => {
            var uuid = {user_list:[message.from]};
            this.userService.getUserList(uuid).then(
                (list) => {
                  conv.memberInfo = list[0];
            });
            conv.onLine = true;
            if (message.content.type === -1) {
              conv.lastMessage = this.transferEmoji(message);
            }else{
              conv.lastMessage = message;
            }
            conv.lastMessageTime = Date.now();
            this.cacheMessage(message,conv);
            this.conversations.unshift(conv);
          }
        );
      }
      this.unreadMessageAdd();

    });
    //on message end

    $scope.$on('conv.created', (event, conv) => {
      this.currentConversation = conv;

      let currentConv = this.findFirstMatch(
        this.conversations,
        conv => conv.id === this.currentConversation.id
      );

      if (currentConv) {
        currentConv.unreadMessagesCount = 0;
        if (this.$scope.contactTop) {
          currentConv.lastMessageTime = Date.now();
        }
      }else{
          /* 新对话建立 */
          var joinDefaultConversationPromise = rt.conv(conv.id);
          joinDefaultConversationPromise.then(
            (conv) => {
              for (var i = this.repos.length - 1; i >= 0; i--) {
                if (this.repos[i].uuid.slice(1) === this.getSingleConvTarget(conv.members)) {
                    conv.memberInfo = this.repos[i];
                    conv.lastMessageTime = Date.now();
                    this.conversations.unshift(conv);
                    break;
                }
              }
            }
          );
      }

      this.unreadMessageAdd();

    });

    /* 更新最新一条对话信息 */
    $scope.$on('conv.messagesent', (event, message) => {
      let currentConv = this.findFirstMatch(
        this.conversations,
        conv => conv.id === this.currentConversation.id
      );
      if (currentConv) {
        this.cacheMessage(message,currentConv);
        currentConv.lastMessageTime = Date.now();

        if (message.content.type === -1) {
          currentConv.lastMessage = this.transferEmoji(message);
        }else{
          currentConv.lastMessage = message;
        }

      }
    });

    $rootScope.$broadcast('bodyVisible');

    $window.onbeforeunload = function(e) {
        return e = e || window.event,
        e && (e.returnValue = "关闭浏览器聊天内容将会丢失。"),
        "关闭浏览器聊天内容将会丢失。";
    };

}

/*
  ========================= controller method =========================
*/

  blankPage(url){
    this.$window.open(this.$state.href(url), '_blank');
  }

  unreadMessageAdd(){
      if (document.body.className === 'hidden') {
        var count = 0;
        this.$rootScope.titleInterval = this.$interval(()=>{
          (count%2) === 0 ? document.title = '您有新的消息,请查收' : document.title = '微配配件商';
          count++ ;
          if (count > 20) {
            this.$interval.cancel(this.$rootScope.titleInterval);
          }
        },2000);
      }

      var totalUnreadMessageCount = this.conversations.reduce((previous, conv) => previous + (conv.unreadMessagesCount || 0),0);
      if (totalUnreadMessageCount > 0) {
        this.$scope.$broadcast('unreadMessageReddot');
      }
  }

  handleOnLine(onLineList){
    if (onLineList.length !== 0) {
        angular.forEach(this.conversations,(conv) => {
            if (onLineList.indexOf(this.getSingleConvTarget(conv.members)) >= 0) {
                  conv.onLine = true;
                  conv.lastMessageTime = Date.now();
            }else{
                conv.onLine = false;
            }
        });
    }
  }

 handleOnLineInterval(onLineList) {
    if (onLineList.length !== 0) {
        angular.forEach(this.conversations,(conv) => {
            if (onLineList.indexOf(this.getSingleConvTarget(conv.members)) >= 0) {
                  if (!conv.onLine) {
                    conv.onLine = true;
                  }
                  conv.lastMessageTime = Date.now();
            }else{
              conv.onLine = false;
            }
        });
    }else{
        angular.forEach(this.conversations,(conv) => {
          conv.onLine = false;
        });
    }
  }

  /* 消息通知 当前聊天窗口hidden的时候 消息提醒notification*/
 notification(message){
    if (message.from === this.userService.user.uuid) return; //避免给自己发送通知
    if (document.body.className === 'hidden') {
        var notifier = '消息提醒',
              icon = 'favicon.ico',
              text = '';
        for (var i = this.conversations.length - 1; i >= 0; i--) {
          if (this.getSingleConvTarget(this.conversations[i].members) === message.from) {
              notifier = this.conversations[i].memberInfo.realname;
              icon = this.conversations[i].memberInfo.avatar_url + '?imageView2/1/w/90/h/90';
              break;
          }
        }

        switch(message.content.type){
          case -1:
            text = message.content.text;
            break;
          case -2:
            text = '发来一张[图片信息]';
            break;
          case -3:
            text = '发来一段[语音消息]';
            break;
        }

        var n = this.notificationFactory.create(notifier,{
          icon : icon,
          body: text
        });

        n.onclick = function(){
          event.preventDefault();
          n.close();
          this.$window.focus();
        };
    }
 }

  /* 表情符号转换 */
  transferEmoji(message){
      var emoji =  message.content.text.replace(this.EMOJIREG, function (value) {
        value = value.replace(/:/g,' ').trim();
        return '<img class="emoji" src="../../assets/image/basic/'+value+'.png">';
      });
      message.content.text = emoji;

      if (typeof message.chatTo !== 'undefined') {
        angular.element('#bindEmoji-'+message.chatTo).html(emoji);
      }else{
        angular.element('#bindEmoji-'+message.from).html(emoji);
      }

      return message;
  }

  /* 缓存对话消息 */
  cacheMessage(message,conv){
      if (typeof conv.messages === 'undefined') {
        conv.messages = [];
      }
      conv.messages.push(message);
      this.$scope.$broadcast('message.refresh');
  }

  /* 搜索联系人 */
  querySearch (query) {
    var results = query !== '' ? this.repos.filter( this.createFilterFor(query) ) : this.repos;
    results.length > 0 ? results.unshift({title:'联系人列表',realname:'0'}) : results.unshift({title:'未搜索到联系人',realname:'0'});
    return results;
  }

 /* 获取联系人联系人列表 */
 loadContact() {
    this.userService.getContactList().then(
      (lists) => {
        this.contactList = lists;
        this.getContactListDone = true;
        this.repos = this.transform(lists).map( function (list) {
          list.realname = list.realname.toLowerCase();
          return list;
        });
      }
    );
  }

  /* 转换为数组 */
  transform(array) {
    var lists = [];
    angular.forEach(array,(arr)=>{
      angular.forEach(arr.user,(user)=>{
        lists.push(user);
      });
    });
    return lists;
  }

  createFilterFor(query) {
    var lower = angular.lowercase(query);
    return function filterFn(repo) {
      if (!repo.title) {
        return angular.lowercase(repo.pinyin).indexOf(lower) >= 0 || repo.realname.indexOf(lower) >= 0 ||  repo.mobile.indexOf(lower) >= 0 || repo.merchant.name.indexOf(lower) >= 0 || repo.merchant.contact_number.indexOf(lower) >= 0;
      }
    };
  }

  selectedItemChange (contact){
    if (typeof contact !== 'undefined' && !contact.title) {
        this.$scope.contactTop = true;
        this.$scope.IMView = true;
        this.tabSelectedIndex = 0;
        this.conversationCache.setCurrentChatUser(contact);
        this.$scope.$broadcast('setCurrentChatUser');
        this.$state.go('conversation.message', {
          clientId: '@' + contact.uuid
        });

        this.close('menu');
    }else{
      this.searchText = '';
    }
  }

  getUUIDByConvs (convs) {
    var ids = [];
    angular.forEach(convs,(val) => {
      ids.push(this.getSingleConvTarget(val.members));
    });
    return ids;
  }

  getUserListByUUIDs (ids) {
    if(ids.length === 0) {
      this.getUserListDone = true;
      return;
    }
    var uuids = {user_list:ids};
    this.userService.getUserList(uuids).then(
        (lists) => {
          angular.forEach(lists,(lval) => {
              angular.forEach(this.conversations,(cval) => {
                if (this.getSingleConvTarget(cval.members) === lval.uuid) {
                    cval.memberInfo = lval;
                }
              });
        });
        this.getUserListDone = true;
    });
  }

  findFirstMatch(arr, check) {
    if (!arr) {
      return;
    }
    for (let i = 0, len = arr.length; i < len; i++) {
      if (check(arr[i])) {
        return arr[i];
      }
    }
  }

  getSingleConvTarget(members) {
    if (members[0] === this.userService.user.uuid) {
      return members[1];
    } else {
      return members[0];
    }
  }

  sysTo(sysId){
    this.conversationCache.setCurrentChatUser({});
    this.$scope.$broadcast('setCurrentChatUser');
    this.$state.go('conversation.message', {
      clientId: sysId
    });
    this.close('menu');
  }

  changeTo(conv,view) {
    this.$scope.contactTop = false;
    if (view) {
      this.$scope.IMView = false;
    }else{
      this.$scope.IMView = true;
    }
    var clientId = '@'+this.getSingleConvTarget(conv.members);

    this.conversationCache.setCurrentChatUser(conv.memberInfo);
    this.$scope.$broadcast('setCurrentChatUser');
    this.$state.go('conversation.message', {
      clientId: clientId
    });
    this.close('menu');
  }

  viewTo(contact,view) {
    this.$scope.contactTop = true;
    if (view) {
      this.$scope.IMView = true;
      this.tabSelectedIndex = 0;
      if (contact.uuid[0] !== '@') {
        contact.uuid = '@' + contact.uuid;
      }
    }else{
      this.$scope.IMView = false;
      if (contact.uuid[0] === '@') {
        contact.uuid = contact.uuid.slice(1);
      }
    }
    this.conversationCache.setCurrentChatUser(contact);
    this.$scope.$broadcast('setCurrentChatUser');

    this.$state.go('conversation.message', {
      clientId: contact.uuid
    });
    this.close('menu');
  }

  toggle(id) {
    this.$mdSidenav(id).toggle();
  }

  close(id) {
    this.$mdSidenav(id).close();
  }

  logout() {
    this.conversationCache.clearAll();
    this.userService.logout();
    this.$state.go('login');
  }

}

export default ConversationController;
