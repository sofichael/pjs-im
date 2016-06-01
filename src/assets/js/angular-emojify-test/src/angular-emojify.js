angular.module('emojify', []);

angular.module('emojify')
  .directive(
    'emojify',

    [
      '$log',
      '$timeout',
      'EMOJIDICT',
      'EMOJIREG',

      function(
        $log,
        $timeout,
        EMOJIDICT,
        EMOJIREG
      ) {
        'use strict';

        return {
          restrict: 'A',
          link: function(scope, element, attrs) {
            scope.emojify = function(text) {
              return text.replace(EMOJIREG, function (value) {
                return '<img alt="' + EMOJIDICT[value]['name'] + '" src="https://abs.twimg.com/emoji/v1/72x72/' + EMOJIDICT[value]['twitter-id'] + '.png">';
              });
            }

            $timeout(function() {
              element.html(scope.emojify(element.html()));
            });
          }
        };
      }
    ]
  )

  .constant(
    'EMOJIDICT',
    @@dict
  )

  .constant(
    'EMOJIREG',
    @@reg
  )
;
