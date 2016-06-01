class AccountingController {
  constructor($state, $window, $rootScope, QuoteService) {
    'ngInject';

    this.$state = $state;
    this.quoteService = QuoteService;
    this.moneyApplicationSearch();
    $rootScope.$broadcast('bodyVisible');
    this.accountId = 0;
  }

  check(key,accountId){
    this.checked = key;
    this.accountId = accountId;
  }

  moneyApplicationSearch(){
    this.quoteService.moneyApplicationSearch().then(
      (data) => {
        var application = data.not_draw.applications.reverse();
        if (data.not_draw.not_draw_list.length > 0 && application[0]) {
            for(var j = 0, len = application[0].data.length; j < len; j++){
                if (application[0].data[j].status===1) {
                  this.note = true;
                  break;
                }
            }
        }
        if (typeof data.not_draw.settlement_account !== 'undefined' && data.not_draw.settlement_account.length > 0) {
          this.accountId = data.not_draw.settlement_account[0].id;
        }
        this.data = data.not_draw;

        this.loading = false;
      }
    );
  }

  postDraw(){
    var bill = [];
    for(var i = 0, length = this.data.not_draw_list.length; i < length; i++){
        bill.push({id:this.data.not_draw_list[i].id});
    };
    this.frame = false;
    var data = {
                       "pay_account_id": this.accountId, //付款账户编号
                       "bill": bill
                    };
    this.quoteService.postDraw(data).then(
      (data) => {
        // console.log(data);
        this.loading = true;
        this.moneyApplicationSearch();
      }
    );
  }

}

export default AccountingController;
