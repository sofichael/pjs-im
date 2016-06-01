class QuoteController {
  constructor($scope, $state, $log, $rootScope, $mdDialog, $mdToast, $timeout, $mdSidenav, QuoteService, UserService) {
    'ngInject';

    this.$scope = $scope;
    this.$state = $state;
    this.$log = $log;
    this.$rootScope = $rootScope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.$timeout = $timeout;
    this.$mdSidenav = $mdSidenav;

    this.addNew = false;
    this.modified = false;

    this.addQuote = false;
    this.addModel = -1;
    this.PKEY = -1;
    this.KEY = -1;

    this.quoteForm = {};
    this.quoteService = QuoteService;
    this.quoteAttributes = UserService.getAttributes();

    if (typeof this.$state.params.inquirySheetId === 'string' && this.$state.params.inquirySheetId !== 'login') {
      this.getQuoteInfoDetail();
    }else if(this.$state.params.inquirySheetId !== 'login'){
      this.notFound = '不存在';
      this.$rootScope.$broadcast('bodyVisible');
      this.mdToast('询价单不存在',10000);
    }

    this.timeStamp = new Date().getTime();
  }

  getQuoteInfoDetail(quotationSheetId){
    var quotationSheetId = typeof quotationSheetId !== 'undefined' ? quotationSheetId : 0;
    this.quoteService.getQuoteInfoDetail(this.$state.params.inquirySheetId, quotationSheetId).then(
      (data) => {
        if (quotationSheetId === 0) {
          this.quoteInfo = data.profile;
          this.$rootScope.$broadcast('bodyVisible');
        }else{
          this.colleaguesQuoteInfo = data.profile;
        }
      }
    );
  }

  /**
   * 编辑模式模块
   */
  init(){
    this.PKEY = -1;
    this.KEY = -1;
    this.msg = '';
  }
  editOpen(value,pkey,key){
    if (this.addModel !==-1) {
      this.msg = '请先完成(取消)添加报价再修改';
      return;
    }
    //禁止两个报价处于编辑模式
    if (this.PKEY !== -1 && this.KEY !== -1) {
      this.msg = '请先完成当前(取消)编辑报价';
      return;
    }

    this.PKEY = pkey;
    this.KEY = key;
    this.quoteInfo.quoted_accessories[pkey].quoted[key].edit=true;
    this.value = angular.copy(value);
  }
  // 修改完成
  editDone(value){
    if (typeof value['price'] === 'undefined') {
      angular.element('.quote-box-edit .price').addClass('price-invalid');
      return;
    }

    //判断是否有修改
    ['price','accessories_level','accessories_quality_gurantee_period','accessories_arrival','notes'].map((key) => {
      if (value[key] !== this.value[key]) {
        this.modified = true;
      }
    });

    this.quoteInfo.quoted_accessories[this.PKEY].quoted[this.KEY].edit=false;
    this.init();
  }
  // 取消编辑
  editCancel(){
    this.quoteInfo.quoted_accessories[this.PKEY].quoted[this.KEY] = this.value;
    this.quoteInfo.quoted_accessories[this.PKEY].quoted[this.KEY].edit=false;

    this.init();
  }

  validForm(val,addClass){
      if (addClass) {
        angular.element('md-input-container.'+val).addClass('md-input-invalid');
        angular.element('md-input-container.'+val+' .input-msg').css({
          opacity: 1,
          marginTop: 0
        });
      }else{
        angular.element('md-input-container.'+val).removeClass('md-input-invalid');
        angular.element('md-input-container.'+val+' .input-msg').css({
          opacity: 0,
          marginTop: -100
        });
      }
  }

  validCheck(data){
      if (typeof data === 'undefined' || typeof data.price === 'undefined') {
          this.validForm('input-price',true);
          return false;
      }else{
          this.validForm('input-price',false);
      }
      if (typeof data.accessories_level === 'undefined') {
        this.validForm('input-level',true);
        return false;
      }else{
          this.validForm('input-level',false);
      }
      if (typeof data.accessories_quality_gurantee_period === 'undefined') {
        this.validForm('input-quality',true);
        return false;
      }else{
          this.validForm('input-quality',false);
      }
      if (typeof data.accessories_arrival === 'undefined') {
        this.validForm('input-arrival',true);
        return false;
      }else{
          this.validForm('input-arrival',false);
      }
      return true;
  }

  packaging(id,data){

      var quoted = {};

      quoted.price = data.price;
      quoted.accessories_level = parseInt(data.accessories_level);
      quoted.accessories_quality_gurantee_period = parseInt(data.accessories_quality_gurantee_period);
      quoted.accessories_arrival = parseInt(data.accessories_arrival);
      quoted.notes = data.notes;
      //新增标志
      quoted.new = true;
      var quote = {'inquiry_sheet_accessories_id':id,'quoted':quoted};
      return quote;
  }

  delNew(pkey,key){
    this.quoteInfo.quoted_accessories[pkey].quoted.splice(key,1);
  }

  add(pkey,inquirySheetAccessoriesId,myQuote){
    this.msg = '';

    if (this.PKEY !== -1 && this.KEY !== -1) {
      this.msg = '请先完成(取消)编辑报价再添加报价';
      return;
    }

    //配件索引
    this.PKEY = pkey;

    if (this.addModel !== pkey) {
      this.addModel = pkey;
    }else{
      if (!this.validCheck(myQuote)) return;
      var quote = this.packaging(inquirySheetAccessoriesId,myQuote);
      this.quoteInfo.quoted_accessories[pkey].quoted.push(quote.quoted);
      this.addNew = true;
      this.clearAdd(pkey);
    }
  }

  clearAdd(pkey){
    this.addModel = -1;
    this.quoteInfo.quoted_accessories[pkey].myQuote = {};
    this.init();
  }

  validCheckSubmit(form){
      if (form.$valid) return true;
      if (!form.price.$valid) {
          this.validForm('input-price',true);
          return false;
      }else{
          this.validForm('input-price',false);
      }
      if (!form.level.$valid) {
        this.validForm('input-level',true);
        return false;
      }else{
          this.validForm('input-level',false);
      }
      if (!form.quality.$valid) {
        this.validForm('input-quality',true);
        return false;
      }else{
          this.validForm('input-quality',false);
      }
      if (!form.arrival.$valid) {
        this.validForm('input-arrival',true);
        return false;
      }else{
          this.validForm('input-arrival',false);
      }
      return true;
  }

  quotationSheet(formData){
    this.quoteService.quotationSheet(formData).then(
      (data) => {
        this.addQuote = false;
        this.loading = false;

        this.quoteInfo.id = data.quotation_sheet_id;
        this.quoteInfo.status = 2;
        this.mdToast('报价成功',5000);
      }
    );
  }

  modifyQuotationSheet(formData){
    this.quoteService.modifyQuotationSheet(formData).then(
      () => {
        this.addQuote = false;
        this.loading = false;

        this.mdToast('报价成功',5000);
      }
    );
  }

  mdToast(msg,delay){
      this.$mdToast.show(
        this.$mdToast.simple()
        .content(`${msg}`)
        .position('top right')
        .hideDelay(delay)
      );
  }

  cancel(){
    this.addQuote = !this.addQuote;
    this.addModel = -1;
    if (this.PKEY !== -1 && this.KEY !== -1) {
      this.editCancel();
    }
    if (this.PKEY !== -1) {
    this.quoteInfo.quoted_accessories[this.PKEY].myQuote = {};
    }
    this.init();
  }

  submit(form){

    //显示取消按钮
    if (!this.addQuote) {
      this.addQuote = !this.addQuote;
      return;
    }
    //先确认添加/修改报价
    if (this.PKEY !== -1 && this.quoteInfo.quoted_accessories[this.PKEY].quoted[this.KEY].edit) {
      this.msg = '请先确认修改/取消编辑中的报价';
      return;
    }

    //判断是否有新增报价/修改报价
    if (!this.addNew && !this.modified) {
      this.msg = '未修改/新增报价';
      return;
    }

    if (!this.validCheckSubmit(form)) return;

    this.loading = true;

    this.addNew = false;
    this.modified = false;
    // return;
    /**
     *  创建报价单
     *  修改报价单
     *  1待处理 2进行中 3 已过期
     */
    if (this.quoteInfo.status === 2) {
      for(var i = this.quoteInfo.quoted_accessories.length - 1; i >= 0 ; i--){
        this.quoteInfo.quoted_accessories[i].quotation_sheet_accessories_id = this.quoteInfo.quoted_accessories[i].inquiry_sheet_accessories_id;
      }
      this.modifyQuotationSheet({
        "quotation_sheet_id":this.quoteInfo.id,
        "quoted_accessories":this.quoteInfo.quoted_accessories
      });
    }else{
      this.quotationSheet({
        "inquiry_sheet_id":this.$state.params.inquirySheetId,
        "quoted_accessories":this.quoteInfo.quoted_accessories
      });
    }

  }

  /* 查看图片 */
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

  viewImageController($scope, $mdDialog, _this,data) {
      $scope.data = {url:data};
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
      var matrix = obj.css("-webkit-transform") ||  obj.css("-moz-transform") ||  obj.css("-ms-transform")  ||  obj.css("-o-transform") ||  obj.css("transform");
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

  /* 同事报价详情 */
  showQuotationSheet(navId,colleague) {
      this.colleague = colleague;
      // this.quotationSheetId = colleague.id;
      if (this.isSideNavOpen) {
        // this.quotationSheetId = 0;
        this.$mdSidenav(navId).close();
      }

      this.getQuoteInfoDetail(colleague.id);
      return this.debounce(() => {
        this.$mdSidenav(navId).toggle();
      }, 500,this.$scope,this.$timeout);
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

}

export default QuoteController;
