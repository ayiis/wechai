#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# 解决uft-8中文序列化报错的问题
import sys
reload(sys).setdefaultencoding("utf-8")

import os
sys.path.insert(0, os.path.realpath("%s/.." % os.path.dirname(os.path.abspath(__file__))))

import tornado
from tornado import websocket, ioloop, gen
from tornado import web
from tornado.options import define, options

import traceback

from common import tool, my_mongodb

import config

from routes import (
    message_manage,
    contact_manage,
    room_manage,
    send_any_message,
)


@gen.coroutine
def start_web(ws_handler, mongodbs):

    from routes import router
    try:

        define("port", default=config.SYSTEM["listening_port"], help="run on the given port", type=int)
        options.parse_command_line()

        router.add_get_url_handlers({
            "/": "index.html",
            "/message_manage": "message_manage.html",
            "/login": "login.html",
            "/account": "account.html",
        })
        router.add_post_url_handlers({
            "/user_login": {},
            "/user_logout": {},

            "/api/contact_list_query": contact_manage.contact_list_query,
            "/api/message_list_query": message_manage.message_list_query,

            "/api/room_list_query": room_manage.room_list_query,
            "/api/room_message_list_query": room_manage.room_message_list_query,

            "/api/send_any_message": send_any_message.do,
        })

        settings = {
            "debug": True,
            # "autoreload": True,
            "db_wechai": mongodbs["db_wechai"],
            # "template_path": os.path.join(os.path.dirname(__file__), "static"),
            "static_path": os.path.join(os.path.dirname(__file__), "static"),
            # "static_url_prefix": "",
        }

        tornado.web.Application([
            (r"/.*", router.DefaultRouterHandler),  # 默认处理方法，其他处理方法需在此方法之前声明
            # (r".*", proxy.ProxyHandler),            # ProxyHandler
        ], **settings).listen(options.port)

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

    except Exception:
        print traceback.format_exc()

    # ioloop.IOLoop.instance().stop()


if __name__ == '__main__':
    init()
    ioloop.IOLoop.instance().start()
