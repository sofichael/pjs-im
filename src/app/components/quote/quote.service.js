class QuoteService {
  constructor($http, $state, $q, $timeout, $mdToast, $rootScope, $log, rt, config, conversationCache) {
    'ngInject';

    this.$q = $q;
    this.$http = $http;
    this.$state = $state;
    this.$mdToast = $mdToast;
    this.$timeout = $timeout;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.rt = rt;
    this.config = config;
    this.conversationCache = conversationCache;
  }

  getToken() {
    try {
      return JSON.parse(localStorage.getItem('token'));
    } catch (e) {
      return undefined;
    }
  }

  getQuoteInfoDetail(inquirySheetId, quotationSheetId){
      var deferred = this.$q.defer();
      this.$http.get(this.config.api + 'quotation/sheet/profile?inquiry_sheet_id='+inquirySheetId+'&quotation_sheet_id='+quotationSheetId,{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          this.handleError(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  //采购单详情
  orderProfile(id){
      var deferred = this.$q.defer();
      this.$http.get(this.config.api + 'order/profile?order_id='+id,{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  //创建
  quotationSheet(data){
      var deferred = this.$q.defer();
      this.$http.post(this.config.api + 'quotation/sheet',data,{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }
  //创建 修改报价单
  modifyQuotationSheet(data){
      var deferred = this.$q.defer();
      this.$http.put(this.config.api + 'quotation/sheet',data,{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  //检测收单码
  checkCode(code){
      var data = {recipient_code:code};
      var deferred = this.$q.defer();
      this.$http.post(this.config.api + 'recipient/check/code',data,{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0 || result.data.status_code === 422 || result.data.status_code === 500) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  //是否支持微配物流
  checkLogistics(id){
      var data = {repair_shop_id:id};
      var deferred = this.$q.defer();
      this.$http.post(this.config.api + 'accessory-shop/check/logistics',data,{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0 || result.data.status_code === 500) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  //获取品牌
  getBrands(){
      var deferred = this.$q.defer();
      this.$http.get(this.config.api + 'auto/brands',{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0 || result.data.status_code === 500) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  //获取车系
  getSeries(brandId){
      var deferred = this.$q.defer();
      this.$http.get(this.config.api + 'auto/series?brand_id='+brandId,{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0 || result.data.status_code === 500) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  //搜索配件
  searchAccessories(search){
      var deferred = this.$q.defer();
      this.$http.get(this.config.api + 'accessories?search=' + search,{headers:{Authorization:this.getToken()}}).then(
      // this.$http.get(this.config.api + 'accessories?search=灯',{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0 || result.data.status_code === 500) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  //支付采购单
  immediateOrder(data){
      var deferred = this.$q.defer();
      this.$http.post(this.config.api + 'immediate/order',data,{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0 || result.data.status_code === 500) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  //提款记录搜索
  moneyApplicationSearch(){
      var deferred = this.$q.defer();
      this.$http.get(this.config.api + 'money/application/search',{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0 || result.data.status_code === 500) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  //提款申请
  postDraw(data){
      var deferred = this.$q.defer();
      this.$http.post(this.config.api + 'money/draw',data,{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0 || result.data.status_code === 422 || result.data.status_code === 500) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  //结算账户
  settlementList(data){
      var deferred = this.$q.defer();
      this.$http.post(this.config.api + 'settlement/list',data,{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0 || result.data.status_code === 500) {
                deferred.resolve(result.data);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.$log.debug(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // localStorage.removeItem('attributes');
    this.close();
    this._connected = false;
  }

  close() {
    this.rt.close();
  }

  /**
   * [handleError description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   * 422 报价数据不完整
   */
  handleError(data){

    [403,404,422,500].map((code) => {
      if (parseInt(data.status_code) === code) {
          this.$mdToast.show(
            this.$mdToast.simple()
            .content(`「${data.message}」`)
            .position('top right')
            .hideDelay(5000)
          );
          this.$rootScope.$broadcast('bodyVisible');
      }
    });

    [601,602,603].map((code) => {
      if (parseInt(data.status_code) === code) {
        this.conversationCache.clearAll();
        this.logout();
        this.$state.go('login');
      }
    });
  }
}

export default QuoteService;
