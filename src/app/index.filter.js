'use strict';

/**
 * @ngdoc function
 * @name pjs.uiFilter
 * @description UI模块
 * uiFilter of the pjs
 */

angular.module('CustomFilter', [])
.filter('attributeString',function(){
      var data = JSON.parse(localStorage.getItem('attributes'));
      if (!data) return 'null';
      var transformed = '';
      return function(val,index){
           val = JSON.parse(val);
           if (data[index-1].attribute_id === index) {
                for (var i = 0; i < data[index-1].attribute_sub.length; i++) {
                    if (data[index-1].attribute_sub[i].attribute_id === val) {
                        transformed = data[index-1].attribute_sub[i].attribute_name;
                        return transformed;
                    }
                };
           }
      };
})

.filter('fromNow',function(){
      return function(myDate){
          if (typeof myDate === 'undefined') return;
          var myTime = new Date(myDate).getTime();
          var timeNow = parseInt(new Date().getTime()/1000);
          var d,days,hours,minutes;
          d = timeNow - myTime;
          days = parseInt(d/86400);
          hours = parseInt(d/3600);
          minutes = parseInt(d/60);
          if(days > 0 && days < 4){
              return days + '天前';
          }else if(days <= 0 && hours > 0){
              return hours + '小时前';
          }else if(hours <= 0 && minutes > 0){
              return minutes + '分钟前';
          }else if(d > 0 && d<=60){
              return d + '秒前';
          }else{
              return myDate;
          }
      };
})

.filter('replace',function(){
      return function(str){
          if (typeof str === 'undefined') return;
          var len = str.length;
          if (len < 4) return str;
          if (len >= 4 && len <=8) return str.substr(0, 2) + '****' + str.substr(-2);
          if (len > 8 ) return str.substr(0, 4) + '********' + str.substr(-2); str.subst
      };
})

.filter('dateTrans',function(){
      return function(myDate){
          if (typeof myDate === 'undefined') return;
          return moment(myDate).format('LL') +' '+ moment(myDate).format('LTS');
      };
})

.filter('getTotal',function(){
      return function(items,type){
          if (typeof items === 'undefined') return;
          var total = 0;
          if (type === 1) {
              for (var i = items.length - 1; i >= 0; i--) {
                  if (typeof items[i].orderAccessory !== 'undefined' &&
                      typeof items[i].orderAccessory.quoted !== 'undefined' && items[i].orderAccessory.quoted.length > 0) {
                      for (var j = items[i].orderAccessory.quoted.length - 1; j >= 0; j--) {
                        total += items[i].orderAccessory.quoted[j].price*items[i].orderAccessory.quoted[j].number;
                      };
                  }
              };
              return total.toFixed(2);
          }if (type === 0) {
              for (var i = items.length - 1; i >= 0; i--) {
                  if (typeof items[i].order_accessories !== 'undefined' && items[i].order_accessories.length > 0) {
                      for (var j = items[i].order_accessories.length - 1; j >= 0; j--) {
                        total += items[i].order_accessories[j].price*items[i].order_accessories[j].number;
                      };
                  }
              };
              return total.toFixed(2);
          }else{
              for (var i = items.length - 1; i >= 0; i--) {
                 total += items[i].price*items[i].number;
              };
              return total.toFixed(2);
          }
      };
})