function PurchaseDirective() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {
      item: '=',
      attrs: '=',
      key: '=index',
      delItem: '&',
    },
    templateUrl: 'app/components/purchase/purchase-directive.html',
    controller: PurchaseController,
    controllerAs: 'vm',
    bindToController: true
  };
}

class PurchaseController {
  constructor() {
    'ngInject';

    this.item.orderAccessory = {accessories_id:this.item.id,
                                               quoted:[]};
    this.addQuote = {};
    this.addBox = false;
  }

  // init item and new
  add(){
    this.addBox = true;
  }


  validCheck(addQuote){
    if (typeof addQuote === 'undefined' || typeof addQuote.price === 'undefined') {
        angular.element('.quote-box-edit input.price').addClass('input-invalid');
        return false;
    }else{
        angular.element('.quote-box-edit input.price').removeClass('input-invalid');
    }
    if (typeof addQuote.number === 'undefined') {
        angular.element('.quote-box-edit input.num').addClass('input-invalid');
        return false;
    }else{
        angular.element('.quote-box-edit input.num').removeClass('input-invalid');
    }
    if (addQuote.accessories_level == 0) {
      angular.element('.quote-box-edit md-select.level').addClass('input-invalid');
      return false;
    }else{
      angular.element('.quote-box-edit md-select.level').removeClass('input-invalid');
    }
    if (addQuote.accessories_quality_gurantee_period == 0) {
      angular.element('.quote-box-edit md-select.quality').addClass('input-invalid');
      return false;
    }else{
      angular.element('.quote-box-edit md-select.quality').removeClass('input-invalid');
    }
    if (addQuote.accessories_arrival == 0) {
      angular.element('.quote-box-edit md-select.arrival').addClass('input-invalid');
      return false;
    }else{
      angular.element('.quote-box-edit md-select.arrival').removeClass('input-invalid');
    }
    return true;
  }

  //确认添加
  addDone(){
    if (this.validCheck(this.addQuote)) {
        this.item.orderAccessory.quoted.push(this.addQuote);
        this.item.msg = false;
        this.addQuote = {};
        this.addBox = false;
    };
  }
  //取消添加
  addCancel(){
    this.addQuote = {};
    this.addBox = false;
  }

  //删除已添加的价格
  delQuote(key){
    this.item.orderAccessory.quoted.splice(key, 1);
  }

}

  export default PurchaseDirective;
