# angular-emojify

Angular directive to emojify unicode chars.

## Installation

`bower install angular-emojify --save`

## Usage

Inject module into you app:

```javascript
angular.module('YourApp', ['emojify']);
```

Use it at a [directive](http://docs.angularjs.org/guide/directive):

```html
<div ng-bind="unicode" emojify></div>
```

> **Note**: if you're uglifying your files (e.g. [grunt-contrib-uglify](https://github.com/gruntjs/grunt-contrib-uglify)) take care about unicode characters with the following options
```js
options : {
  beautify : {
    ascii_only : true
  }
}
```

## Contributing

1. [Fork it](http://github.com/code/angular-emojify/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

**NB**: don't forget to run grunt server as `grunt dev` (it will update the `angular-emojify.js` and `angular-emojify.min.js` generated files)
