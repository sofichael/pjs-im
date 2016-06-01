class PurchaseController {
  constructor($scope, $state, $log, $q, $rootScope, $mdDialog, $mdToast, $timeout, $mdSidenav, $window, QuoteService, UserService) {
    'ngInject';

    this.$scope = $scope;
    this.$state = $state;
    this.$log = $log;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.$timeout = $timeout;
    this.$mdSidenav = $mdSidenav;
    this.quoteService = QuoteService;
    this.userService = UserService;

    this.checked = 0;
    this.isSupport = false;
    this.cahceBrands = [];
    this.cahceSeries = [];
    //autocomplete
    this.simulateQuery = true;
    this.isDisabled    = false;
    this.accessories = [];
    this.items = [
                        // {"id":767,"title":"点火开关","is_normal":"no","tag":2}
                        // {"id":927,"title":"点火开关2","is_normal":"no","tag":3},
                        ],
    this.attrs = UserService.getAttributes();
    this.selectedItemChange = this.selectedItemChange;
    this.searchTextChange   = this.searchTextChange;

    // this.checkCode('80462623');
    this.$rootScope.$broadcast('bodyVisible');
  }

    //货运方式
    toggle(val){
        this.checked = val;
    }

    //85136931
    checkCode(code){
        if (angular.isUndefined(code)) {
            this.checkMsg = true;
            this.msg = '你填写收单码';
            return;
        }else{
            this.checkMsg = false;
        }

        if (code.match(/^\d{8}$/ig)) {
            this.sheet = true;
            this.checkMsg = false;
            this.checkCodeLoading = true;
            this.quoteService.checkCode(code).then(
              (data) => {
                this.checkCodeLoading = false;
                if (data.status_code === 500) {
                    this.checkMsg = true;
                    this.msg = '你使用的收单码有误,请重新与维修厂确认';
                }else{
                    var uuid = {user_list:[data.user.uuid]};
                    this.merchantLoading = true;
                    this.userService.getUserList(uuid).then(
                        (list) => {
                          this.merchantLoading = false;
                          this.purchaseSheet = list[0];
                          this.checkLogistics(list[0].merchant.id);
                    });
                    angular.element('.purchase .purchase-code').addClass('hide');
                    angular.element('.purchase .purchase-sheet').css('bottom',0);
                }
              }
            );
        }else{
            this.checkMsg = true;
            this.msg = '收单码为8位数字';
            return;
        }
    }

    checkLogistics(id){
        this.quoteService.checkLogistics(id).then(
          (data) => {
            this.isSupportLoading = false;
            if (data.status_code === 500) {
                this.checked = 2;
            }else{
                this.isSupport = true;
                this.checked = 1;
            }
          }
        );
    }

    autocomplete() {
        angular.element('md-autocomplete input').focus();
    }

    querySearch (query) {
        var results = query ? this.accessories.filter( this.createFilterFor(query) ) : this.accessories,
        deferred;
        if (this.simulateQuery) {
            deferred = this.$q.defer();
            this.quoteService.searchAccessories(query).then(
              (lists) => {
                var accessories = this.transform(lists).map( function (list) {
                    list.title = list.title.toLowerCase();
                    return list;
                });
                if (accessories.length === 0 && query !== null) {
                    accessories = [{"id":0,"title":query,"is_normal":"no","tag":3}];
                    this.item = {"id":0,"title":query,"is_normal":"no","tag":3};
                    angular.element('md-autocomplete input').css('padding-left', '60px');
                }
                deferred.resolve( accessories );
              }
            );
            return deferred.promise;
        } else {
            return results;
        }
    }

    /* 转换为数组 */
    transform(array) {
        var lists = [];
        angular.forEach(array.accessories,(arr)=>{
          angular.forEach(arr.sub,(sub)=>{
            lists.push(sub);
          });
        });
        return lists;
    }

    createFilterFor(query) {
        var lower = angular.lowercase(query);
        return function filterFn(accessory) {
          if (accessory.title) {
            return accessory.title.indexOf(lower) >= 0;
          }
        };
    }

    searchTextChange(search) {
        console.debug('Text changed to ' + search);

        angular.element('.purchase-sheet .search-icon.auto-complete').css('margin-left', '0px');
        if (search === '') {
            angular.element('md-autocomplete input').css('padding-left', '30px');
            this.item = false;
        }
    }

    selectedItemChange(item) {
      if (typeof item === 'undefined') return;
      console.debug('Item changed to ' + JSON.stringify(item));
      angular.element('md-autocomplete input').css('padding-left', '60px');
      this.item = item;
      this.items.push(item);
    }

    delItem(index){
        this.items.splice(index, 1);
        console.log(this.items);
    }

    //获取车型
    getBrands(){
        if (this.carBrand && !this.carSeries) {
            return this.$mdSidenav('series').toggle();
        };
        if (this.cahceBrands.length > 0) {
            this.cars = this.cahceBrands;
            return this.$mdSidenav('brand').toggle();
        };
        this.toggleCarLoading = true;
        this.quoteService.getBrands().then(
          (data) => {
            console.log(data);
            if (data.status_code === 500) {

            }else{
                this.cars = data.brands;
                this.cahceBrands = data.brands;
                this.toggleCarLoading = false;

                return this.debounce(() => {
                this.$mdSidenav('brand').toggle();
                }, 500,this.$scope,this.$timeout);
            }
          }
        );
    }

    //获取车系
    getSeries(brand){
        this.carBrand = brand;
        this.getSeriesLoading = true;
        this.quoteService.getSeries(brand.id).then(
          (data) => {
            console.log(data);
            if (data.status_code === 500) {

            }else{
                this.series = data.brand_series;
                this.cahceSeries = data.brand_series;
                this.$mdSidenav('brand').toggle();

                return this.debounce(() => {
                    this.getSeriesLoading = false;
                    this.$mdSidenav('series').toggle();
                }, 500,this.$scope,this.$timeout);
            }
          }
        );
    }

    selSeries(car){
        this.carSeries = car;
        this.$mdSidenav('series').toggle();
    }

    back(){
        this.$mdSidenav('series').toggle();
        return this.debounce(() => {
        this.$mdSidenav('brand').toggle();
        }, 500,this.$scope,this.$timeout);
    }

    /* 选择车型 */
    toggleCar() {
      this.getBrands();
    }

    /**
    * Supplies a function that will continue to operate until the
    * time is up.
    */
    debounce(func, wait, $scope, $timeout) {
    var timer;

    var args = Array.prototype.slice.call(arguments);
    $timeout.cancel(timer);
    timer = $timeout(function() {
      timer = undefined;
      func.apply($scope, args);
    }, wait || 10);

    }

    close(id) {
        this.$mdSidenav(id).close();
    }

    submit(){
        if (this.items.length === 0) {
            this.submitMsg = '请添加至少一个配件并报价';
            return
        };
        var order_accessories = [];
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].orderAccessory.quoted.length === 0) {
                this.items[i].msg = true;
                this.submitMsg = '如要提交请先对该配件报价或删除未报价配件';
                return;
            }else{
                order_accessories.push(this.items[i].orderAccessory)
                this.items[i].msg = false;
                this.submitMsg = false;
            }
        }

        this.submitLoading = true;
        var data = {
               "recipient_code": this.code, //收单码
               "title": "来自"+this.purchaseSheet.merchant.name+"-"+this.purchaseSheet.realname+"的采购单", //采购单
               "consignee": this.purchaseSheet.merchant.name, //收货人信息
               "mobile": this.purchaseSheet.merchant.contact_number, //收货人联系电话
               "address": this.purchaseSheet.merchant.address, //收货人收货地址
               "way": "货运方式", //货运方式
               "shipping_method": this.checked, //发货方式 1 微配直送 2 其他物流
               "brand_id": this.carBrand.id, //品牌
               "series_id": this.carSeries.id, //车系
               "order_accessories": order_accessories
        }
        this.quoteService.immediateOrder(data).then(
          (data) => {
            console.log(data);
            this.submitLoading = false;
            if (data.status_code === 404 || data.status_code === 500) {
                this.submitMsg = '请求异常,请联系客服人员';
            }else{
                this.submitMsg = '发送成功';
            }
          }
        );
    }

}

export default PurchaseController;
