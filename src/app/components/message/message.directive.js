function MessageDirective() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {
      message: '=',
      mine: '=',
      chat: '=',
      previousMessage: '=',
      isMine: '=',
      showImage: '&',
      quoteClick: '&',
      orderClick: '&',
      playVoice: '&'
    },
    templateUrl: 'app/components/message/message.html',
    controller: MessageController,
    controllerAs: 'vm',
    bindToController: true
  };
}

class MessageController {
  constructor() {
    'ngInject';

    if (typeof this.previousMessage === 'undefined') {
      this.displayTime = true;
    }

    if (this.message && this.previousMessage) {
      var thisMinute = Math.floor(this.message.timestamp / 60000);
      var previousMinute = Math.floor(this.previousMessage.timestamp / 60000);
      if (thisMinute !== previousMinute) {
          this.displayTime = true;
        }
    }
    if (moment(this.message.timestamp).isBefore(moment().format('L'))) {
      this.message.timestampFormat = moment(this.message.timestamp).format('L') +' '+ moment(this.message.timestamp).format('LTS');
    }else{
      this.message.timestampFormat = moment(this.message.timestamp).format('LTS');
    }

  }

}

  export default MessageDirective;
