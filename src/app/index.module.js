/* global md5:false */
import config from './index.config';
import filter from './index.filter';

import routerConfig from './index.route';

import runBlock from './index.run';
import ConversationController from './conversation/conversation.controller';
import ConversationMessageController from './conversation/conversation-message/conversation-message.controller';
import QuoteController from './quote/quote.controller';
import OrderController from './order/order.controller';
import PurchaseController from './purchase/purchase.controller';
import AccountingController from './accounting/accounting.controller';
import LoginController from './login/login.controller';

import ConversationCacheService from './components/conversation-cache/conversation-cache.service';
import QuoteService from './components/quote/quote.service';
import UserService from './components/user/user.service';
import ReverseInfiniteListDirective from './components/reverse-infinite-list/reverse-infinite-list.directive';
import MessageDirective from './components/message/message.directive';
import PurchaseDirective from './components/purchase/purchase.directive';
import ImageDirective from './components/image/image.directive';
import QrcodeDirective from './components/qrcode/qrcode.directive';

angular.module('weipei', ['ngResource', 'ui.router', 'ngMaterial', 'ngMessages','ui.gravatar', 'leancloud-realtime', 'ngWebSocket', 'emojify', 'uuid', 'CustomFilter'])
  .constant('md5', md5)
  .constant('EMOJIFYS',['bowtie','smile','laughing','blush','smiley','relaxed','smirk','heart_eyes','kissing_heart','kissing_closed_eyes','flushed','relieved','satisfied','grin','wink','stuck_out_tongue_winking_eye','stuck_out_tongue_closed_eyes','grinning','kissing','kissing_smiling_eyes','stuck_out_tongue','sleeping','worried','frowning','anguished','open_mouth','grimacing','confused','hushed','expressionless','unamused','sweat_smile','sweat','disappointed_relieved','weary','pensive','disappointed','confounded','fearful','cold_sweat','persevere','cry','sob','joy','astonished','scream','neckbeard','tired_face','angry','rage','triumph','sleepy','yum','mask','sunglasses','dizzy_face','imp','smiling_imp','neutral_face','no_mouth','innocent','alien','yellow_heart','blue_heart','purple_heart','heart','green_heart','broken_heart','+1','thumbsup','-1','thumbsdown','ok_hand','punch','facepunch','fist','v','wave','hand','raised_hand','open_hands','point_up','point_down','point_left','point_right','raised_hands','pray','point_up_2','clap','muscle'])
  .constant('EMOJIREG',
    /(:bowtie:|:smile:|:laughing:|:blush:|:smiley:|:relaxed:|:smirk:|:heart_eyes:|:kissing_heart:|:kissing_closed_eyes:|:flushed:|:relieved:|:satisfied:|:grin:|:wink:|:stuck_out_tongue_winking_eye:|:stuck_out_tongue_closed_eyes:|:grinning:|:kissing:|:kissing_smiling_eyes:|:stuck_out_tongue:|:sleeping:|:worried:|:frowning:|:anguished:|:open_mouth:|:grimacing:|:confused:|:hushed:|:expressionless:|:unamused:|:sweat_smile:|:sweat:|:disappointed_relieved:|:weary:|:pensive:|:disappointed:|:confounded:|:fearful:|:cold_sweat:|:persevere:|:cry:|:sob:|:joy:|:astonished:|:scream:|:neckbeard:|:tired_face:|:angry:|:rage:|:triumph:|:sleepy:|:yum:|:mask:|:sunglasses:|:dizzy_face:|:imp:|:smiling_imp:|:neutral_face:|:no_mouth:|:innocent:|:alien:|:yellow_heart:|:blue_heart:|:purple_heart:|:heart:|:green_heart:|:broken_heart:|:+1:|:thumbsup:|:-1:|:thumbsdown:|:ok_hand:|:punch:|:facepunch:|:fist:|:v:|:wave:|:hand:|:raised_hand:|:open_hands:|:point_up:|:point_down:|:point_left:|:point_right:|:raised_hands:|:pray:|:point_up_2:|:clap:|:muscle:)/g
  )
  .config(config)
  .config(routerConfig)
  .run(runBlock)
  .factory('rt', (LCRealtimeFactory) => LCRealtimeFactory())
  // .factory('MyData', ($websocket,$state,UserService,rfc4122) => {

          // var uuid = rfc4122.v4().replace(/-/g,'');
          // var dataStream = $websocket('ws://114.215.177.238:8282/');
          // var collection = [];

          // dataStream.onMessage(function(message) {
          //   console.log(message);
          //   // UserService.login('18160039811', 18160039811)
          //   // .then(() => $state.go('conversation.message'));

          //   // collection.push(JSON.parse(message.data));
          // });

          // var methods = {
          //   uuid: uuid,
          //   collection: collection,
          //   sendMsg: function() {
          //     dataStream.send(JSON.stringify([uuid, "Hello, World!"]));
          //   }
          // };

          // return methods;
  //     }
  // )
  .factory('notificationFactory', ($window) => {

          function notificationInWindow() {
              if (!("Notification" in $window)) {
                  return false;
              }
              return true;
          }

          function notification() {
              if($window.Notification && Notification.permission !== 'granted'){
                Notification.requestPermission();
                return false;
              }
              return true;
          }

          function notify(msg) {
            alert(msg);
          }

          function create(title,option) {
              var o;
              return notificationInWindow() ? notification() ? o = new window.Notification(title,{
                  icon: option.icon,
                  body: option.body
              }) : notify("浏览器提醒通知被禁止,请设置!")  : notify("浏览器不支持提醒通知!");
          }

          var methods = {
            create : create
          };

          return methods;

    }
  )
  .service('config', function($window) {
          if ($window.location.host.match(/pjs\.weipei\.cc/)){
              return  { api:'',
                            appId:'',
                            appKey:'',
                            // defaultConversation:'',
                            sysConversation:'',
                          };
          } else{
              return  { api:'',
                            appId:'',
                            appKey:'',
                            // defaultConversation:'',
                            sysConversation:'',
                          };
          }
  })
  .service('conversationCache', ConversationCacheService)
  .service('QuoteService', QuoteService)
  .service('UserService', UserService)
  .directive('infiniteList', ReverseInfiniteListDirective)
  .directive('message', MessageDirective)
  .directive('purchase', PurchaseDirective)
  .directive('image', ImageDirective)
  .directive('qrcode', QrcodeDirective)
  .controller('ConversationController', ConversationController)
  .controller('ConversationMessageController', ConversationMessageController)
  .controller('QuoteController', QuoteController)
  .controller('OrderController', OrderController)
  .controller('PurchaseController', PurchaseController)
  .controller('AccountingController', AccountingController)
  .controller('LoginController', LoginController);
