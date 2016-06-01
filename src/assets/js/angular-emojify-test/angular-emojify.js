angular.module('emojify', []);

angular.module('emojify')
  .directive(
    'emojify',

    [
      '$log',
      '$timeout',
      'EMOJIREG',

      function(
        $log,
        $timeout,
        EMOJIREG
      ) {
        'use strict';

        return {
          restrict: 'A',
          link: function(scope, element, attrs) {
            scope.emojify = function(text) {
              text = text.replace(/&lt;img class="emoji" src="..\/..\/assets\/image\/basic\/|.png"&gt;/img,':');
              return text.replace(EMOJIREG, function (value) {
                value = value.replace(/:/g,' ').trim();
                return '<img class="emoji" src="../../assets/image/basic/'+value+'.png">';
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
    'EMOJIREG',
    /(:bowtie:|:smile:|:laughing:|:blush:|:smiley:|:relaxed:|:smirk:|:heart_eyes:|:kissing_heart:|:kissing_closed_eyes:|:flushed:|:relieved:|:satisfied:|:grin:|:wink:|:stuck_out_tongue_winking_eye:|:stuck_out_tongue_closed_eyes:|:grinning:|:kissing:|:kissing_smiling_eyes:|:stuck_out_tongue:|:sleeping:|:worried:|:frowning:|:anguished:|:open_mouth:|:grimacing:|:confused:|:hushed:|:expressionless:|:unamused:|:sweat_smile:|:sweat:|:disappointed_relieved:|:weary:|:pensive:|:disappointed:|:confounded:|:fearful:|:cold_sweat:|:persevere:|:cry:|:sob:|:joy:|:astonished:|:scream:|:neckbeard:|:tired_face:|:angry:|:rage:|:triumph:|:sleepy:|:yum:|:mask:|:sunglasses:|:dizzy_face:|:imp:|:smiling_imp:|:neutral_face:|:no_mouth:|:innocent:|:alien:|:yellow_heart:|:blue_heart:|:purple_heart:|:heart:|:green_heart:|:broken_heart:|:+1:|:thumbsup:|:-1:|:thumbsdown:|:ok_hand:|:punch:|:facepunch:|:fist:|:v:|:wave:|:hand:|:raised_hand:|:open_hands:|:point_up:|:point_down:|:point_left:|:point_right:|:raised_hands:|:pray:|:point_up_2:|:clap:|:muscle:)/g
  )
;
