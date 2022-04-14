'use strict';

module.exports = plugin;

function plugin(instance, options) {
  if (instance) {
    instance.output(markdown(options, instance));
  } else {
    const acquit = require('acquit');
    acquit.output(markdown(options, acquit));
  }
};

plugin.markdown = markdown;

function markdown(options, acquit) {
  return function(res) {
    return recurse(res, 0, options, acquit);
  };
}

function recurse(blocks, level, options, acquit) {
  var str = '';
  var hashes = getHashes(level + 1);
  for (var i = 0; i < blocks.length; ++i) {
    if (blocks[i].contents) {
      str += hashes + ' ' + (blocks[i].type === 'it' ? (!options || !options.it ? 'It ': '') : '') +
        blocks[i].contents;
    }
    str += '\n\n';
    for (var j = 0; j < blocks[i].comments.length; ++j) {
      str += acquit.trimEachLine(blocks[i].comments[j]);
      str += '\n\n';
    }
    if (blocks[i].type === 'describe') {
      str += recurse(blocks[i].blocks, level + 1, options, acquit);
    } else if (blocks[i].code.trim() && options.code) {
      str += ['```javascript', blocks[i].code, '```'].join('\n');
    }
    if (i + 1 < blocks.length) {
      str += '\n\n';
    }
  }
  return str;
}

function getHashes(level) {
  var str = '';
  for (var i = 0; i < level; ++i) {
    str += '#';
  }
  return str;
}