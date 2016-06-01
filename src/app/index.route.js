function routerConfig($stateProvider, $urlRouterProvider) {
  'ngInject';
  $stateProvider
    .state('conversation', {
      abstract: true,
      url: '/conversations',
      templateUrl: 'app/conversation/conversation.html',
      controller: 'ConversationController',
      controllerAs: 'conversation'
    })
    .state('conversation.message', {
      url: '/:clientId',
      templateUrl: 'app/conversation/conversation-message/conversation-message.html',
      controller: 'ConversationMessageController',
      controllerAs: 'conversationMessage'
    })
    .state('purchase', {
      url: '/purchase',
      templateUrl: 'app/purchase/purchase.html',
      controller: 'PurchaseController',
      controllerAs: 'purchase'
    })
    .state('quote', {
      url: '/quote:inquirySheetId',
      templateUrl: 'app/quote/quote.html',
      controller: 'QuoteController',
      controllerAs: 'quote'
    })
    .state('order', {
      url: '/order:orderId',
      templateUrl: 'app/order/order.html',
      controller: 'OrderController',
      controllerAs: 'order'
    })
    .state('accounting', {
      url: '/accounting',
      templateUrl: 'app/accounting/accounting.html',
      controller: 'AccountingController',
      controllerAs: 'accounting'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'app/login/login.html',
      controller: 'LoginController',
      controllerAs: 'login'
    });

  // $urlRouterProvider.otherwise('/conversations/' + defaultConversation.id);
  $urlRouterProvider.otherwise('/conversations/');
}

export default routerConfig;
