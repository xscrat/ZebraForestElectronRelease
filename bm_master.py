import json
import sys
import glob
import serial

def get_clients():
    return [1, 2, 3]

def get_serial_ports():
    if sys.platform.startswith('win'):
        ports = ['COM%s' % (i + 1) for i in range(256)]
    elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
        # this excludes your current terminal "/dev/tty"
        ports = glob.glob('/dev/tty[A-Za-z]*')
    elif sys.platform.startswith('darwin'):
        ports = glob.glob('/dev/tty.*')
    else:
        raise EnvironmentError('Unsupported platform')

    result = []
    for port in ports:
        result.append(port)
    return json.dumps(result)

if __name__ == '__main__':
    if sys.argv[1] == 'get_clients':
        clients = get_clients()
        print json.dumps(clients)
    elif sys.argv[1] == 'get_clients_info':
        info = [[1, 1, 50], [2, 0, 60]]
        print json.dumps(info)
    elif sys.argv[1] == 'get_serial_ports':
        print get_serial_ports()
    else:
        pass
