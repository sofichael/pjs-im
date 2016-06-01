class OrderController {
  constructor($scope, $state, $log, $q, $rootScope, $mdDialog, $mdToast, $timeout, $window, QuoteService, UserService) {
    'ngInject';

    this.$scope = $scope;
    this.$state = $state;
    this.$log = $log;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.$timeout = $timeout;
    this.quoteService = QuoteService;
    this.userService = UserService;

    this.attrs = UserService.getAttributes();
    this.orderProfile($state.params.orderId);
  }

    //详情
    orderProfile(id){
        this.quoteService.orderProfile(id).then(
          (data) => {
            if (data.status_code === 500) {
                this.$log.debug(data);
            }else{
                this.profile = data.profile;
                this.$rootScope.$broadcast('bodyVisible');
            }
          }
        );
    }

}

export default OrderController;
