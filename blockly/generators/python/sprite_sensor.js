'use strict';

goog.provide('Blockly.Python.sprite_sensor');
goog.require('Blockly.Python');

Blockly.Python['get_DHT11t'] = function(block) {
  var code = '=bm_master.get_DHT11t(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_DHT11h'] = function(block) {
  var code = '=bm_master.get_DHT11h(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_LX'] = function(block) {
  var code = '=bm_master.get_LX(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_temperature'] = function(block) {
  var code = '=bm_master.get_temperature(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_pressure'] = function(block) {
  var code = '=bm_master.get_pressure(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_speed'] = function(block) {
  var code = '=bm_master.get_speed(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_extend'] = function(block) {
  var code = '=bm_master.get_extend(client=bm_clients[' +
             Blockly.Python.valueToCode(block, 'index', Blockly.Python.ORDER_ATOMIC) +
             '])';
  return [code, Blockly.Python.ORDER_NONE];
};
