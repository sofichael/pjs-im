function config($mdThemingProvider,$logProvider) {
  'ngInject';

  if (window.location.host.match(/pjs\.weipei\.cc/)){
    $logProvider.debugEnabled(false);
  }

  // $mdThemingProvider.theme('default')
  //   .primaryPalette('cyan')
  //   .accentPalette('grey');

  // gravatarServiceProvider.defaults = {
  //   "default": 'retro'
  // };

  $mdThemingProvider.definePalette('amazingPaletteName', {
    '50': 'ffebee',
    '100': 'E4901D',//auto complete clear bottom line color
    '200': 'ef9a9a',
    '300': 'e57373',
    '400': 'ef5350',
    // '500': 'f44336',
    '500': 'f5f5f5',
    '600': 'e53935',
    '700': 'd32f2f',
    '800': 'c62828',
    '900': 'b71c1c',
    'A100': 'ff8a80',
    'A200': 'ff5252',
    'A400': 'ff1744',
    'A700': 'd50000',
    // 'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
    //                                     // on this palette should be dark or light
    // 'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
    //  '200', '300', '400', 'A100'],
    // 'contrastLightColors': undefined    // could also specify this if default was 'dark'
  });
  $mdThemingProvider.theme('default')
  // $mdThemingProvider.theme('altTheme')
    .primaryPalette('amazingPaletteName');

}

export default config;