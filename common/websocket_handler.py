#!/usr/bin/env python
# -*- coding: utf-8 -*-
import tornado
from common import tool
# from db import api_ws_message_log
import datetime
import tornado.websocket
import traceback


MESSAGE_TYPE = {
    None: lambda error_msg: error_msg,
    "test": lambda test_info: "Server got: %s." % test_info,
}


def add_message_handler(url_handler_obj):
    MESSAGE_TYPE.update(url_handler_obj)


# 验证请求的格式，内容
def validate_message(message):

    result = {
        'message_type': None,
        'status': 200,
        'message': None,
        'error_msg': None,
    }

    # 请求必须是JSON格式字符串
    try:
        result['message'] = tool.json_load(message)
        print "result['message']:", result['message']
    except Exception:
        result['message'] = message
        result['status'] = 400
        result['error_msg'] = 'Request body Must be in `JSON` format'
    else:
        if not result['message'].get('message_type'):
            result['status'] = 403
            result['error_msg'] = '`message_type` cannot be none'
        # 请求的 message_type 必须存在
        elif not MESSAGE_TYPE.get(result['message']['message_type']):
            result['status'] = 404
            result['error_msg'] = MESSAGE_TYPE[None]('404: You know what it means')
        else:
            result['message_type'] = result['message']['message_type']

    return result


class DefaultWebsocketHandler(tornado.websocket.WebSocketHandler):
    waiters = set()
    cache = 'Welcome'

    def get_compression_options(self):
        # Non-None enables compression with default options.
        return {}

    def open(self):
        print("Incomming a websocket connection:\r\n", self.request)
        self.access_key = False

    def on_close(self):
        print("Close a websocket connection:\r\n", self.request)
        self.access_key = False
        if self in DefaultWebsocketHandler.waiters:
            DefaultWebsocketHandler.waiters.remove(self)

    def brocast(self, msg):
        print("brocasting message to", len(DefaultWebsocketHandler.waiters), "waiters\r\n", [x.request for x in DefaultWebsocketHandler.waiters], "\r\n", msg)
        DefaultWebsocketHandler.cache = msg
        for waiter in DefaultWebsocketHandler.waiters:
            try:
                waiter.write_message(msg)
            except Exception:
                print("Error sending message to ", waiter.request, ":\r\n", msg)

    def send_message(self, status_code, msg):
        print("sending message to", self.request.remote_ip, ":\r\n", msg)
        try:
            self.write_message({
                'code': status_code,
                'detail': msg,
            })
        except Exception:
            print("Error sending message to ", self.request, ":\r\n", msg)

        # LOG data into mongodb
        data = {
            'request_ip': self.request.remote_ip,
            'request': self.message,
            'message_type': status_code == 200 and self.message.get('message_type'),
            'status_code': status_code,
            'duration': (datetime.datetime.now() - self.ts).total_seconds(),
            'response': msg
        }
        # api_ws_message_log.insert_message(data)

    def on_message(self, message):
        print("Incomming an message:\r\n", message)
        self.ts = datetime.datetime.now()

        # access_key login
        if not self.access_key:
            if message != "123456":
                print("Incomming connection with a WRONG ws_access_key:", message, "\r\n", self.request)
                self.close()
            else:
                self.access_key = True
                DefaultWebsocketHandler.waiters.add(self)
                self.message = {
                    'message_type': 'Access success.',
                    'access_key': message
                }
                self.send_message(200, DefaultWebsocketHandler.cache)
            return

        result = validate_message(message)
        self.message = result['message']

        # 验证失败
        if result['status'] != 200:
            self.send_message(result['status'], result['error_msg'])
            return

        # 获取url对应的处理方法
        handler = MESSAGE_TYPE.get(result['message_type'])

        try:
            response = handler(result['message'])
        except Exception:
            print('处理ws消息失败')
            self.error_msg = traceback.format_exc()
            self.send_message(500, 'Server cause a 500 Error, please contact system admin')
            return

        self.send_message(200, response)
