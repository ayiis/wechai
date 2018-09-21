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
def init():

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
            # "/api/concat_message_list_query": message_manage.message_list_query,

            "/api/room_list_query": room_manage.room_list_query,
            # "/api/room_message_list_query": room_manage.room_message_list_query,

            "/api/send_any_message": send_any_message.do,
        })
        mongodbs = {"db_wechai": None}

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

        print "Listening:", options.port

    except Exception:
        print traceback.format_exc()
        raise


if __name__ == '__main__':
    init()
    ioloop.IOLoop.current().start()
