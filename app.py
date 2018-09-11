#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# 解决uft-8中文序列化报错的问题
import sys
reload(sys).setdefaultencoding("utf-8")

import tornado
from tornado import websocket, ioloop, gen
from tornado import web
import traceback

from common import tool, my_mongodb

from routes import main
from routes.api import recv_any_message
import config
from server import app as server_app

# url = "ws://127.0.0.1:8888/ws"
url = "ws://127.0.0.1:3000/"


@gen.coroutine
def start_web(ws_handler, mongodbs):

    from routes import router
    try:

        router.add_post_url_handlers({
            "/api/recv_any_message": recv_any_message.do,
            "/api/send_any_message": recv_any_message.do,
        })
        settings = {
            "debug": True,
            "ws": ws_handler,
            "db_wechai": mongodbs["db_wechai"],
        }

        tornado.web.Application([
            (r"/.*", router.DefaultRouterHandler),  # 默认处理方法，其他处理方法需在此方法之前声明
        ], **settings).listen(8081)

    except Exception as e:
        print traceback.format_exc()
        raise


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

        yield start_web(ws_handler, mongodbs)

        yield server_app.start_web(ws_handler, mongodbs)

    except Exception:
        print traceback.format_exc()

    # ioloop.IOLoop.instance().stop()


if __name__ == '__main__':
    init()
    ioloop.IOLoop.instance().start()
