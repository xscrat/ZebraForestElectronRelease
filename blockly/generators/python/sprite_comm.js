'use strict';

goog.provide('Blockly.Python.sprite_comm');
goog.require('Blockly.Python');

Blockly.Python['send_uart'] = function(block) {
  var code = 'bm_master.send_uart(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '],value=' +
             Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC) +
             ')';

  return code;
};

Blockly.Python['read_uart'] = function(block) {
  var code = '=bm_master.read_uart(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             ']).decode()';
  return [code, Blockly.Python.ORDER_NONE];
};
