import sys
import glob
from multiprocessing import Process,Manager
from threading import Thread
import serial
import time
import os
import json
import hashlib
class bm:
    msg=""
    rec_arr=Manager().list()
    send_arr=Manager().list()
    serial_enable=Manager().dict()
    ser=None
    def __init__(self,serial_port='/dev/ttyS1',bandurate=115200):
        try:
            self.ser=serial.Serial(serial_port,bandurate,timeout=30)
        except Exception as e:
            print(str(e))
            self.ser.close()
        self.serial_enable[0]=True
        self.ser_read_proc=Process(target=self.__serial_read)
        self.ser_send_proc=Process(target=self.__serial_send)
        self.ser_read_proc.start()
        self.ser_send_proc.start()
        #time.sleep(1)
        print("start")

    def __del__(self):
        enable={0:False}
        self.serial_enable=enable
        print("end")

    def __serial_send(self):#串口发送守护
        while True:
            try:
                enable=self.serial_enable[0]
                if not enable:
                    return
            except Exception:
                return
            send_arr=self.send_arr
            try:
                if len(send_arr)>0:
                    self.ser.write(send_arr[0])
                    time.sleep(0.1)
                    send_arr.remove(send_arr[0])
                    self.send_arr=send_arr
            except Exception:
                pass


    def __serial_read(self,timeout=5):#串口接收守护
        #print("serial_begin")
        while True:
            try:
                enable=self.serial_enable[0]
                if not enable:
                    return
            except Exception:
                return
            tmp_arr=self.rec_arr
            rec_str=self.ser.readline()
            if rec_str:
                try:
                    rec_str=rec_str.decode('utf-8').strip('\n').strip('\r').replace("'","\"")
                    tmp_arr.append([rec_str,time.time()])
                except Exception:
                    pass
            try:
                now_cmd=tmp_arr[0]
                if time.time()-now_cmd[1]>timeout:
                    tmp_arr.remove(now_cmd)
            except Exception:
                pass
            self.rec_arr=tmp_arr

    def __callback_th_func(self,callback,snap,timeout=5):
        start_time=time.time()
        while time.time()-start_time<=timeout:
            rec=self.__find_rec_by_snap(snap)
            if not rec is None:
                break
        callback(rec)


    def __find_rec_by_snap(self,snap):
        msg_arr=[x[0] for x in self.rec_arr]
        for i in range(len(msg_arr)):
            try:
                m=json.loads(msg_arr[i])
                if snap==m['snap']:
                    self.rec_arr.remove(self.rec_arr[i])
                    return m['data']
            except Exception :
                return None
        return None

    def send_data(self,data,timeout=5,callback_func=None):
        snap=hashlib.md5()
        snap.update(str(time.time()).encode('utf-8'))
        snap=snap.hexdigest()[12:-12]
        print(snap)
        body={}
        body['snap']=snap
        body['data']=data
        body=json.dumps(body,ensure_ascii=False)
        body=body+'\r\n'
        #print(body)
        #self.ser.write(body.encode('utf-8'))
        self.send_arr.append(body.encode('utf-8'))
        if callback_func is None:
            start_time=time.time()
            while time.time()-start_time<=timeout:
                rec=self.__find_rec_by_snap(snap)
                if not rec is None:
                    break
            return rec
        else:
            callback_th=Thread(target=self.__callback_th_func,args=(callback_func,snap,timeout))
            callback_th.setDaemon(True)
            callback_th.start()
            return None

    def __json_loads(self,res):
        try:
            res=json.loads(res)
        except Exception:
            pass
        return res

#---------------与斑马妈妈连接的API--------------
        #-------设备管理--------
    def get_clients(self,timeout=5,callback_func=None):#获取设备列表,返回设备id和设备电量
        send={'type':'get','key':'client_list'}
        return self.__json_loads(self.send_data(data=send,timeout=timeout,callback_func=callback_func))
        
        #-------基本输入-------
    def get_digital(self,client,timeout=5,callback_func=None):#获取指定精灵的GPIO数字值
        send={'type':'get','client':client,'key':'digital'}
        return self.__json_loads(self.send_data(data=send,timeout=timeout,callback_func=callback_func))

    def get_analog(self,client,timeout=5,callback_func=None):#获取指定精灵的GPIO电压值
        send={'type':'get','client':client,'key':'analog'}
        return self.__json_loads(self.send_data(data=send,timeout=timeout,callback_func=callback_func))

        #-------基本输出-------
    def set_digital(self,client,value,timeout=5,callback_func=None):#设置指定精灵的GPIO数字值
        send={'type':'set','client':client,'key':'digital','value':value}
        return self.__json_loads(self.send_data(data=send,timeout=timeout,callback_func=callback_func))
    
    def set_analog(self,client,value,timeout=5,callback_func=None):#设置指定精灵的GPIO电压值
        send={'type':'set','client':client,'key':'analog','value':value}
        return self.__json_loads(self.send_data(data=send,timeout=timeout,callback_func=callback_func))

        #-------串口操作-------
    def read_uart(self,client,timeout=5,callback_func=None):#接收指定精灵的收到的串口数据
        send={'type':'get','client':client,'key':'uart'}
        return self.__json_loads(self.send_data(data=send,timeout=timeout,callback_func=callback_func))

    def write_uart(self,client,value,timeout=5,callback_func=None):#让指定精灵的串口发送数据
        send={'type':'set','client':client,'key':'uart','value':value}
        return self.__json_loads(self.send_data(data=send,timeout=timeout,callback_func=callback_func))

        #-------I2C操作--------
    def read_i2c(self,client,addr,timeout=5,callback_func=None):#读取指定精灵的i2c值
        pass
    
    def write_i2c(self,client,addr,value,timeout=5,callback_func=None):#根据地址写入指定精灵的i2c值
        pass

        #-------舵机操作--------
    def set_servo(self,client,angle,timeout=5,callback_func=None):#设置指定精灵上的舵机角度值
        pass
    
        #-------步进电机操作-----
    def set_motor_step(self,client,step,speed,timeout=5,callback_func=None):#设置指定精灵上步进电机的步数
        pass
    
    def set_motor_speed(self,client,speed,timeout=5,callback_func=None):#设置指定精灵上步进电机的转速
        pass

        #-------直流电机控制操作-----
            #设置直流电机输出功率

        #-------WS2812B灯带操作-----
            #设置某个灯珠的颜色
            #通过数组设置灯带颜色

        #-------12864显示器操作-----
            #设置液晶屏显示内容
            #清空液晶屏显示内容

        #-------超声波传感器操作-----
            #获取超声波传感器的距离值

        #-------速度传感器操作-----
            #通过回调方式获取速度传感器检测到的值

        #-------DHT11温湿度传感器操作-----
            #获取传感器的温湿度值

        #-------DS18B20温度探头操作-----
            #获取传感器的温度值

        #-------BMP280大气压强传感器操作-----
            #获取大气压强值
            #获取环境温度值

        #-------姿态传感器操作-----
            #获取当前加速度传感器的值
            #获取当前角速度传感器的值

        #-------GPIO频率获取-----
            #获取GPIO口高低电平的变化频率
            #获取ADC口的频域列表

        #-------设置精灵工作模式操作-----
            #开启黑匣子记录模式
            #关闭黑匣子记录模式
            #进入低功耗状态
            #退出低功耗状态
            #获取黑匣子记录值
            #清空黑匣子记录

def get_clients_dummy():
    return ['1', '2']

def get_power_dummy(client):
    return 50

def get_serial_ports_dummy():
    return ['COM1', 'COM2']

if __name__ == '__main__':
    if sys.argv[1] == 'get_clients':
        clients = get_clients_dummy()
        print(json.dumps(clients))
    elif sys.argv[1] == 'get_clients_info':
        clients = json.loads(sys.argv[2])
        info = []
        for client in clients:
            info.append([client, 1, get_power_dummy(client)]);
        print(json.dumps(info))
    elif sys.argv[1] == 'get_serial_ports':
        print(json.dumps(get_serial_ports_dummy()))
    else:
        pass
