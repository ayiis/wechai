#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# 解决uft-8中文序列化报错的问题
import sys
reload(sys).setdefaultencoding("utf-8")

# import tornado
from tornado import websocket, ioloop, gen
from tornado import web
import traceback

from common import tool, my_mongodb

from routes import main
import config
from server import app as server_app

# url = "ws://127.0.0.1:8888/ws"
url = "ws://127.0.0.1:3000/"


@gen.coroutine
def init():

    try:
        mongodbs = yield my_mongodb.init(config.MONGODB)

        conf = {
            "url": url,
            "db_wechai": mongodbs["db_wechai"],
        }
        ws_handler = main.Main(conf)
        yield ws_handler.connect()

        yield server_app.start_web(ws_handler, mongodbs)

    except Exception:
        print traceback.format_exc()

    # ioloop.IOLoop.instance().stop()


if __name__ == '__main__':
    init()
    ioloop.IOLoop.instance().start()
