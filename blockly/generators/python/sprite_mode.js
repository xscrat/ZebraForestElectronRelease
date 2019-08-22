'use strict';

goog.provide('Blockly.Python.sprite_mode');
goog.require('Blockly.Python');

Blockly.Python['set_normal'] = function(block) {
  var code = 'bm_master.set_normal(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return code;
};

Blockly.Python['set_int'] = function(block) {
  var branch = Blockly.Python.statementToCode(block, 'DO');
  var index = Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC)
  var code = 'bm_master.set_int(client=bm_clients[' + index +
             '],method=' + block.getFieldValue('value') +
             ',int_func=func_bm_clients[' + index +
             '])\n' + 'def func_bm_clients[' + index +
             ']:\n' +
             branch;

  return code;
};

Blockly.Python['set_lowpower'] = function(block) {
  var code = 'bm_master.set_lowpower(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '], interval=' +
             Blockly.Python.valueToCode(block, 'interval', Blockly.Python.ORDER_ATOMIC) +
             ', func=' + block.getFieldValue('function') +
             ')';
  return code;
};

Blockly.Python['get_eeprom'] = function(block) {
  var code = '=bm_master.get_eeprom(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return [code, Blockly.Python.ORDER_NONE];
};
