#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

import sys

import tornado
from tornado import ioloop, gen
import tornado.web
import traceback

from common import my_mongodb

from routes import main
import config

from routes import ws_handler
from db import (
    concat,
    concat_message,
    room,
    room_message
)

# url = "ws://127.0.0.1:8888/ws"
url = "ws://127.0.0.1:3000/"
# 解决uft-8中文序列化报错的问题
reload(sys).setdefaultencoding("utf-8")


@gen.coroutine
def init():

    mongodbs = yield my_mongodb.init(config.MONGODB)

    routes = {
        "init": lambda self, data: {},
        "concat.concat_list_query": concat.concat_list_query,
        "concat_message.concat_message_list_query": concat_message.concat_message_list_query,
        "room.room_list_query": room.room_list_query,
        "room_message.room_message_list_query": room_message.room_message_list_query,
    }
    # ws_handler.WechatyHandler.define_route(routes)

    ws_handler.ServerHandler.define_route(routes)

    settings = {
        "debug": True,
        "autoreload": True,
        "db_wechai": mongodbs["db_wechai"],
    }

    tornado.web.Application([
        (r"/ws_wechaty", ws_handler.WechatyHandler),
        (r"/ws_server", ws_handler.ServerHandler),
    ], **settings).listen(config.SYSTEM["listening_port"])

    print "ws Listen:", config.SYSTEM["listening_port"]

    yield init2(mongodbs)


@gen.coroutine
def init2(mongodbs):

    url = "ws://127.0.0.1:3000/"

    try:
        conf = {
            "url": url,
            "db_wechai": mongodbs["db_wechai"],
        }
        ws_handler = main.Main(conf)
        yield ws_handler.connect()

    except Exception:
        print traceback.format_exc()

    # ioloop.IOLoop.instance().stop()


if __name__ == '__main__':
    init()
    ioloop.IOLoop.instance().start()
