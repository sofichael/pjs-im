class UserService {
  constructor($http, $state, $q, $timeout, $mdToast, rt, config, conversationCache, $log) {
    'ngInject';

    this.user = {};
    this._connected = false;
    this.$q = $q;
    this.$http = $http;
    this.$state = $state;
    this.$mdToast = $mdToast;
    this.$timeout = $timeout;
    this.rt = rt;
    this.$log = $log;
    this.config = config;
    this.conversationCache = conversationCache;
    this.msg = {'mobile_or_password_error' : '用户名/密码错误',
                     'Trying to get property of non-object' : '系统错误,对象不存在...'
                    };
  }

  setToken(token) {
    localStorage.setItem('token', JSON.stringify('Bearer '+token));
  }

  getToken() {
    try {
      return JSON.parse(localStorage.getItem('token'));
    } catch (e) {
      return undefined;
    }
  }

  isCached() {
    try {
      return localStorage.getItem('user') !== null;
    } catch (e) {
      return false;
    }
  }

  cache(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getCachedInfo() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
      return undefined;
    }
  }


  setAttributes(attributes) {
    localStorage.setItem('attributes', JSON.stringify(attributes));
  }

  getAttributes() {
    try {
      return JSON.parse(localStorage.getItem('attributes'));
    } catch (e) {
      return undefined;
    }
  }

  bootstrap(){
    var deferred = this.$q.defer();
    this.$http.get(this.config.api + 'bootstrap?type=0').then(
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

  login(user,callback) {
    var _that = this;
    this.$http.post(this.config.api + 'oauth/token',user).then(
      (result) => {
        if (result.data.status_code === 0) {
          if (result.data.user.uuid !== '') {
            _that.setToken(result.data.token);
            _that.connect(result.data.user);
          }else{
            callback(result.data);
            this.mdToast('「用户uuid不存在」,请联系客服...',5000);
          }
        }else{
          callback(result.data);
          this.handleError(result.data);
        }
      },
      (error) => {
        this.$log.debug(error);
        return false;
      });
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('attributes');
    this.close();
    this._connected = false;
  }

  isLoggedin() {
    return this._connected;
  }

  connect(user) {
    this._connected = true;
    this.user = user;
    this.cache(user);
    this.conversationCache.setCurrentClientId(user.uuid);
    return this.rt.connect({
      appId: this.config.appId,
      clientId: user.uuid
    }).then(this.$state.go('conversation.message'));
  }

  close() {
    this.rt.close();
  }

  getContactList(){
      var deferred = this.$q.defer();

      this.$http.get(this.config.api + 'user/contacts',{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0) {
                deferred.resolve(result.data.contacts);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.handleError(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  getUserList(uuids){
      var deferred = this.$q.defer();
      this.$http.post(this.config.api + 'user/chat/list',uuids,{headers:{Authorization:this.getToken()}}).then(
        (result) => {
            if (result.data.status_code === 0) {
                deferred.resolve(result.data.user_list);
            }else{
              this.handleError(result.data);
            }
        },
        (error) => {
          this.handleError(error);
          deferred.reject(error);
          return false;
        });
        return deferred.promise;
  }

  mdToast(msg,delay){
      this.$mdToast.show(
        this.$mdToast.simple()
        .content(`${msg}`)
        .position('top right')
        .hideDelay(delay)
      );
  }

  handleError(error){
    this.$log.error(error);
    var msg = typeof this.msg[error.message] !== 'undefined' ? this.msg[error.message] : error.message;
    [-1].map((code) => {
      if (parseInt(error.status) === code) {
          this.mdToast('系统异常,请刷新重试...',10000);
          return;
      }
    });
    [401,404,422,500].map((code) => {
      if (parseInt(error.status_code) === code) {
          this.mdToast(msg,10000);
          return;
      }
    });
    [601,602,603].map((code) => {
      if (parseInt(error.status_code) === code) {
        this.conversationCache.clearAll();
        this.logout();
        this.$state.go('login');
        return;
      }
    });
  }
}

export default UserService;
