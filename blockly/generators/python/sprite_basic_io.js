'use strict';

goog.provide('Blockly.Python.sprite_basic_io');
goog.require('Blockly.Python');

Blockly.Python['basic_input'] = function(block) {
  var code = '=input(' +
             Blockly.Python.valueToCode(block, 'hint', Blockly.Python.ORDER_ATOMIC) +
             ')';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['basic_output'] = function(block) {
  var code = 'print ' +
             Blockly.Python.valueToCode(block, 'output_content', Blockly.Python.ORDER_ATOMIC);
  return code;
};
