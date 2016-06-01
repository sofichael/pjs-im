class LoginController {
  constructor($state, $window, $rootScope, UserService, md5) {
    'ngInject';

    this.$state = $state;
    this.userService = UserService;
    this.md5 = md5;

    this.bootstrap();
    this.title = '扫描登录';
    this.year = new Date().getFullYear();
    this.user = {
      mobile:'',
      password:'',
      user_role:2,
      client:2
    };

    this.v = 10;
    this.e = 'H';
    this.s = 250;
    // this.uuid = MyData.uuid;
    // this.url = $window.location.origin + '/u/' + this.uuid;
    this.url = 'http://192.168.0.120:8080/u/' + this.uuid;
    // this.MyData = MyData;
    // this.MyData.sendMsg();
    $rootScope.$broadcast('bodyVisible');
  }

  bootstrap(){
    if (!this.userService.getAttributes()) {
        this.userService.bootstrap().then(
          (data) => {
            this.userService.setAttributes(data.attributes);
            this.quoteAttributes = data.attributes;
          }
        );
    }else{
      this.quoteAttributes = this.userService.getAttributes();
    }
  }

  login(form,event) {
    if ((typeof event !== 'undefined' && event.keyCode === 13) || typeof event === 'undefined') {
      if (!form.$valid) {return false};
      this.load = true;
      this.userService.login(this.user,() => {this.load = false;});
    }
  }

  target(show) {
    show ? this.title = '扫描登录' : this.title = '密码登录';
  }

}

export default LoginController;
