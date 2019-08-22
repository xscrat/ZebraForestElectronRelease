'use strict';

goog.provide('Blockly.Python.sprite_basic');
goog.require('Blockly.Python');

Blockly.Python['get_clients'] = function(block) {
  var code = '=bm_master.get_clients()';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_power'] = function(block) {
  var code = '=bm_master.get_power(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['set_blink'] = function(block) {
  var code = '=bm_master.set_blink(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return code;
};

Blockly.Python['get_digital'] = function(block) {
  var code = '=bm_master.get_digital(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_analog'] = function(block) {
  var code = '=bm_master.get_analog(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['set_digital'] = function(block) {
  var code = 'bm_master.set_digital(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '],value=' +
             Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC) +
             ')';

  return code;
};

Blockly.Python['set_analog'] = function(block) {
  var code = 'bm_master.set_analog(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '],value=' +
             + block.getFieldValue('value') +
             ')';

  return code;
};

Blockly.Python['set_rainbow'] = function(block) {
  var code = 'bm_master.set_rainbow(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '],value=' +
             Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC) +
             ')';

  return code;
};
