class ConversationMessageController {
  constructor($mdSidenav, $state, $scope, $rootScope, $q, $log, rt, EMOJIREG, EMOJIFYS, LCTextMessage, LCTypedMessage, conversationCache, UserService, $timeout, $window, $anchorScroll, $mdDialog, config) {
    'ngInject';

    this.userService = UserService;
    this.$mdDialog = $mdDialog;
    this.$mdSidenav = $mdSidenav;
    this.$state = $state;
    this.$timeout = $timeout;
    this.$anchorScroll = $anchorScroll;
    this.$scope = $scope;
    this.$log = $log;
    this.$window = $window;

    this.LCTextMessage = LCTextMessage;
    this.LCTypedMessage = LCTypedMessage;

    this.currentUser = UserService.getCachedInfo();
    this.conversationCache = conversationCache;
    this.currentChatUser = conversationCache.getCurrentChatUser();

    this.messages = [];
    this.isTyping = '';
    this.IMView = $scope.IMView;
    if (typeof $scope.IMView === 'undefined') {
      this.IMView = true;
    }

    this.ctrlDown = false;
    this.ctrlKey = 17;
    this.vKey = 86;
    this.cKey = 67;
    this.eKey = 13;

    this.EMOJIFYS = EMOJIFYS;
    this.EMOJIREG = EMOJIREG;

    var conversationPromise, conversationId, conversationRoute = $state.params.clientId;

    // 当有未读消息时，菜单按钮显示小红点 执行优先级高
    $scope.$on('unreadMessageReddot', () => this.hasUnreadMessage = true);

    if (typeof this.currentChatUser === 'undefined' && $state.params.clientId !== config.sysConversation) {
        $state.go('conversation.message', {
          clientId: '@'
        });
        this.conv = {
          name:'WPIM',
          text: '欢迎使用微配IM'
        };
        return;
    }
    if (conversationRoute[0] === '@' && conversationRoute.match(/^@repair_[0-9a-z]{32}$/)) {
      // 单聊
      var clientId = conversationRoute.slice(1);
      conversationPromise = conversationCache.getConversationId(clientId).then((conversationId) => {
        if (conversationId === null) {
          var newConversationPromise = rt.conv({
            name: clientId,
            unique: true,
            members: [clientId,this.currentUser.uuid]
          });
          newConversationPromise.then(
            (conv) => conversationCache.setConversationId(clientId, conv.id)
          );
          return newConversationPromise;
        } else {
          return rt.conv(conversationId);
        }

      });

    } else if (conversationRoute.match(/^[0-9a-z]{24}$/)) {
      // 群聊 / 系统消息
      // this.isGroupConversation = true;
      conversationId = conversationRoute;
      conversationPromise = rt.conv(conversationId);
    } else if (conversationRoute === '') {
      // conversationPromise = $q.reject(new Error('WPIM'));
      //可进入默认对话
      this.changeTo(config.sysConversation, {
        location: 'replace'
      });
    } else {
      conversationPromise = $q.reject(new Error('WPIM'));
    }

    if (conversationPromise) {

      conversationPromise.then((conv) => {
        // console.log(conv);
        this.conv = conv;

        // conv.log({limit:-1},null).then((messages) => {
        //   console.log(messages);
        //   var filterMessage = [];
        //   angular.forEach(messages,function(el){
        //     if (typeof el !== 'undefined') {
        //       if (typeof el.content.attr !== 'undefined' && typeof el.content.attr !== 'object') {
        //           el.content.attr = JSON.parse(el.content.attr);
        //       }
        //       filterMessage.push(el);
        //     }
        //   });
        //   this.messages = filterMessage.concat(this.messages);
        //   this.scrollToBottom();
        // });

        /* 只添加到当前窗口对话中 */
        var convs = this.$scope.$parent.conversation.conversations;

        for (var i = convs.length - 1; i >= 0; i--) {
          if (convs[i].id === conv.id) {
            typeof convs[i].messages === 'undefined' ? this.messages = [] : this.messages = convs[i].messages;
            this.scrollToBottom();
            break;
          }
        }

        // conv.on('message', (message) => {
        //     this.lastMessageId = message.id;
        //     this.messages.push(message);
        //     this.scrollToBottom();
        // });

        // sdk 未完善  TODO: implement SDK 中的 Conversation::off 方法  line 417
        //$scope.$on('$destroy', () => conv.destroy()); //暂时无作用

        $scope.$on('message.refresh', () => this.refresh());

        $scope.$emit('conv.created', conv);

      }.bind(this)).catch((e) => {
        // 将异常信息显示在页面上
        this.conv = {
          name: e.message,
          text: '欢迎使用微配IM'
        };
      }.bind(this));
    }

    // 缓存对方信息
    $scope.$on('setCurrentChatUser', () => this.currentChatUser = conversationCache.getCurrentChatUser());

    // 1s 停止显示正在输入
    $scope.$on('conv.isTyping', () => this.isTyping = '');

    // 发送图片
    $scope.$watch('conversationMessage.myImageFile', (input) => {
          if (typeof input !== 'undefined') {
            this.sendImg(input);
          }
    });

    this.player = angular.element('#voiceMsgPlayer');

    this.T = function() {
      window.MMplayingMsg && (window.MMplayingMsg.MMPlaying = !1,
      window.MMplayingMsg = null ,
      $scope.$$phase || $scope.$digest());
    };

    angular.element(this.$window).bind('keyup', ($event) => {
        if ($event.keyCode === this.ctrlKey){
            this.ctrlDown = false;
        }
        this.$scope.$apply();
    });

    angular.element(this.$window).bind('keydown', ($event) => {
        if ($event.keyCode === this.ctrlKey){
            this.ctrlDown = true;
        }
        this.$scope.$apply();
    });

  }

  /* ========================= controller method =========================*/

  refresh() {
        var convs = this.$scope.$parent.conversation.conversations;

        for (var i = convs.length - 1; i >= 0; i--) {
          if (convs[i].id === this.conv.id) {
            typeof convs[i].messages === 'undefined' ? this.messages = [] : this.messages = convs[i].messages;
            this.scrollToBottom();
            break;
          }
        }
  }


  //输入表情符号
  typeEmojify(val) {
    angular.element('<img class="emoji" src="../../assets/image/basic/'+val+'.png">').appendTo('#editArea');
    angular.element('#editArea').focus();
  }

  keyup($event) {
    var a = angular.element('#editArea');
    if (this.ctrlDown && ($event.keyCode === this.cKey)) {
        this.$log.debug('Ctrl + C pressed');
    } else if (this.ctrlDown && ($event.keyCode === this.vKey)) {
        this.$log.debug('Ctrl + V pressed');
        //解析图片格式
        a.html(a.html().trim().replace(/<img class="emoji" src="..\/..\/assets\/image\/basic\/|.png">/img,':'));
        a.html(a.html().trim().replace(/<img class="emoji" src="\S*\/assets\/image\/basic\/|.png" style="font-size: medium; font-family: 'Helvetica Neue', Helvetica, 'Hiragino Sans GB', 'Microsoft YaHei', 微软雅黑, Arial, sans-serif;">/img,':'));
        //解析其它复制格式
        a.html(a.text());
        //还原图片图片格式
        var html =  a.text().replace(this.EMOJIREG, function (value) {
                            value = value.replace(/:/g,'').trim();
                            return '<img class="emoji" src="../../assets/image/basic/'+value+'.png">';
                          });
        a.html(html);
    } else if (this.ctrlDown && String.fromCharCode($event.which).toLowerCase() === 's') {
        $event.preventDefault();
        this.$log.debug('Ctrl + S pressed');
    }

  }

  getMsg() {
      if (angular.element('#editArea').html() === '') return;
      return angular.element('#editArea').html().replace(/<img class="emoji" src="..\/..\/assets\/image\/basic\/|.png">/img,':');
  }

  send() {
    this.emojifyTable = false;
    if (!this.getMsg()) return;
    var message = new this.LCTextMessage({text:this.getMsg(),type:'text'});
    message._state = 'sending';
    message.id = Date.now();
    if (this.$state.params.clientId[0]==='@') {
      message.chatTo = this.$state.params.clientId.slice(1);
    }else{
      message.chatTo = this.$state.params.clientId;
    }
    this.scrollToBottom();
    this.$log.debug(message);
    this.conv.send(message).then(
      (message) => {
        message._state = 'sended', () => message._state = 'failed';
        this.$scope.$emit('conv.messagesent',angular.copy(message));
      }
    );

    angular.element('#editArea').html('');
  }

  sendImg(input){
        var _that = this;
        var img = new Image();
        img.onload = () => {
          var avFile = new AV.File(input.file.name, input.file);
          var _this = this;
          var filedata = {
                               url: '',
                               type:'image',
                               attr: {},
                               metaData: {
                                name:input.file.name,
                                format:input.file.type,
                                width: _this.width,
                                height: _this.height,
                                size: input.file.size
                               }
          };

          var message = new _that.LCTypedMessage(filedata);
          message._state = 'sending';
          message.chatTo = this.$state.params.clientId.slice(1);
          _that.scrollToBottom();

          avFile.save().then(function(obj) {
            message.id = Date.now();
            message.content.url = obj.url();
            _that.$log.debug(message);
            _that.conv.send(message).then(
              (message) => {
                message._state = 'sended', () => message._state = 'failed';
              _that.$scope.$emit('conv.messagesent',angular.copy(message));
            }
            );


          }, function(err) {
            message._state = 'failed';
            _that.$log.debug(err);
          });
        };
        img.src = input.dataURL;
  }

  //回车发送
  editorChangedHandler(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      if ((angular.element('#editArea').html() === '' || angular.element('#editArea').html().indexOf('<div><br></div>') >= 0 )) {
        event.preventDefault();
        return false;
      }
      this.send();
      event.preventDefault();
      return false;
    }
  }

  changeTo(clientId, options) {
    this.$state.go('conversation.message', {
      clientId: clientId
    }, options);
    this.closeAll();
  }

  toggle(id) {
    this.$mdSidenav(id).toggle();
  }

  close(id) {
    try {
      this.$mdSidenav(id).close();
    } catch (e) {
      return undefined;
    }
  }
  closeAll() {
    // ['online', 'online-search'].map((id) => this.close(id));
  }

  scrollToBottom() {
    return this.$timeout(() => this.$anchorScroll('message-view-bottom'), 500);
  }

  // loadMore() {
  //   if (this.conv === undefined || this.conv.noMore) {
  //     return;
  //   }

  //   if (this.loading) {
  //         this.conv.log({
  //           t: this.messages.length ? this.messages[0].timestamp : null
  //         }, null).then((messages) => {
  //           this.conv.noMore = messages.length === 0 ? true : false;
  //           this.messages = messages.concat(this.messages);
  //           this.loading = false;
  //         });
  //   }
  //   this.loading = true;
  // }

  // 查看图片
  showImage(ev,data) {
    this.$mdDialog.show({
      controller: this.viewImageController,
      locals : {_this:this,data:data},
      templateUrl: 'app/conversation/conversation-message/image-dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      // fullscreen: useFullScreen,
      clickOutsideToClose:true
    });
  }

  // 查看图片对话框Controller
  viewImageController($scope, $mdDialog, _this,data) {
      $scope.data = data;
      $scope.deg = 'rotate(0deg)';

      if (data.attr && data.attr.h) {
          $scope.maxHeight = 600*data.attr.h/data.attr.w;
      }

      $scope.rotate = () => {
          var angle = _this.getRotationDegrees(angular.element('md-dialog img')) + 90;
          $scope.deg = 'rotate('+angle+'deg)';
      };

      $scope.cancel = () => {
        $mdDialog.cancel();
      };
  }

  getRotationDegrees(obj) {
      var matrix = obj.css('-webkit-transform') ||  obj.css('-moz-transform') ||  obj.css('-ms-transform')  ||  obj.css('-o-transform') ||  obj.css('transform');
      var angle;
      if(matrix !== 'none') {
          var values = matrix.split('(')[1].split(')')[0].split(',');
          var a = values[0];
          var b = values[1];
          angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
      } else {
        angle = 0;
      }
      return (angle < 0) ? angle + 360 : angle;
  }

  quote(ev,inquirySheetId){
    var url = this.$state.href('quote', {inquirySheetId: inquirySheetId});
    this.$window.open(url, '_blank');
  }

  order(ev,orderId){
    var url = this.$state.href('order', {orderId: orderId});
    this.$window.open(url, '_blank');
  }

  playVoice(ev,message) {
    if (window.MMplayingMsg) {
        if (message.id === window.MMplayingMsg.id && message.MMPlaying)  {
          message.MMPlaying = 0;
          return void this.player.jPlayer('stop');
        }
        this.T();
    }
    message.MMVoiceUnRead = !0;
    message.MMPlaying = !0;
    // message.MMPlaying === !0 ? message.MMPlaying = !0 : message.MMPlaying = 0;
    this.player.jPlayer({
        ready: function() {},
        timeupdate: function() {},
        play: function() {},
        pause: this.T,
        ended: this.T,
        // swfPath: window.MMSource.jplayerSwfPath,
        swfPath: 'obj/' ,
        solution: 'html, flash',
        supplied: 'mp3',
        wmode: 'window'
    });
    this.player.jPlayer('stop');
    window.MMplayingMsg = message;
    this.player.jPlayer('setMedia', {
        mp3: message.content.text
    });
    this.player.jPlayer('play');
    this.$timeout(() => message.MMPlaying = 0,(message.msg.metaData.duration + 1)*1000);
  }

}

export default ConversationMessageController;
