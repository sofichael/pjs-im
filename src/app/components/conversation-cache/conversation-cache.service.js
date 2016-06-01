class ConversationCacheService {
  constructor($log, rt) {
    'ngInject';

    this.$log = $log;
    this.rt = rt;

    this._RELATION_KEY = 'clientConversationRelations';
    this.clientConversationRelations = {};
    try {
      this.clientConversationRelations = JSON.parse(localStorage.getItem(this._RELATION_KEY)) || {};
    } catch (e) {
      $log.warn('Error occurred parsing clientConversationRelations from localStorage:', e);
    }

  }

  clearAll() {
    try {
      ['_RELATION_KEY',].forEach((key) => localStorage.removeItem(this[key]));
    } catch (e) {}
    this.clientConversationRelations = {};
  }

  setCurrentClientId(id) {
    this.currentClientId = id;
  }

  setCurrentChatUser(user) {
    this.currentChatUser = user;
  }

  getCurrentChatUser() {
    return this.currentChatUser;
  }

  getConversationId(clientId) {
    if (this.currentClientId === undefined) {
      throw new Error('currentClientId for ConversationCacheService not set.');
    }

    var key = [clientId, this.currentClientId].sort().join(' ');
    // 先从 localstorage 中查询 如果在服务器删除不起作用
    if (this.clientConversationRelations[key]) {
      return Promise.resolve(this.clientConversationRelations[key]);
    }
    // 然后查 server
    return this.rt.queryConvs({
      where: {
        m: {
          $size: 2,
          $all: [clientId, this.currentClientId],
        }
      }
    }).then((convs) => {
      if (convs.length) {
        this.setConversationId(clientId, convs[0].id);
        return convs[0].id;
      } else {
        return null;
      }
    });
  }

  setConversationId(clientId, conversationId) {
    if (this.currentClientId === undefined) {
      throw new Error('currentClientId for ConversationCacheService not set.');
    }
    var key = [clientId, this.currentClientId].sort().join(' ');
    this.clientConversationRelations[key] = conversationId;
    try {
      localStorage.setItem(this._RELATION_KEY, JSON.stringify(this.clientConversationRelations));
    } catch (e) {
      this.$log.warn('Error occurred saving clientConversationRelations to localStorage:', e);
    }
  }

}

export default ConversationCacheService;
