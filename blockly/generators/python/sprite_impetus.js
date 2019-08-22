'use strict';

goog.provide('Blockly.Python.sprite_impetus');
goog.require('Blockly.Python');

Blockly.Python['set_servo'] = function(block) {
  var code = 'bm_master.set_servo(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '],value=' +
             Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC) +
             ')';

  return code;
};

Blockly.Python['set_motor_step'] = function(block) {
  var code = 'bm_master.set_motor_step(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '],value=' +
             Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC) +
             ')';

  return code;
};

Blockly.Python['set_motor_speed'] = function(block) {
  var code = 'bm_master.set_motor_speed(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '],value=' +
             Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC) +
             ')';

  return code;
};
