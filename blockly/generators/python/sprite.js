'use strict';

goog.provide('Blockly.Python.sprite');
goog.require('Blockly.Python');

Blockly.Python['sprite_index'] = function(block) {
  var code = block.getFieldValue('index');
  return [code, Blockly.Python.ORDER_ATOMIC];
};
