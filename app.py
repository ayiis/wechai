#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# 解决uft-8中文序列化报错的问题
import sys
reload(sys).setdefaultencoding("utf-8")

import tornado
from tornado import websocket, web, ioloop, gen
# from websocket import websocket_connect
# import tornado.websocket.websocket_connect
import traceback

url = "ws://127.0.0.1:8888/ws"


@gen.coroutine
def main():

    try:
        conn = yield websocket.websocket_connect(url)
        if True:
            res = yield conn.write_message('123456')
            print "res:", res
            msg = yield conn.read_message()
            # if msg is None:
            #     break
            print "msg:", msg
    except Exception:
        print traceback.format_exc()

    ioloop.IOLoop.instance().stop()


if __name__ == '__main__':
    main()
    ioloop.IOLoop.instance().start()
