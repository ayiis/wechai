#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

import logging
import tornado.escape
import tornado.ioloop
import tornado.websocket
from tornado import gen
from common import tool


class WsHandler(tornado.websocket.WebSocketHandler):

    """docstring for WsHandler"""
    def __init__(self, arg):
        super(WsHandler, self).__init__()
        self.arg = arg

    def get_compression_options(self):
        # Non-None enables compression with default options.
        return {}

    def open(self):
        print "waiters.add:", self
        self.__class__.waiters.add(self)

    def on_close(self):
        print "waiters.remove:", self
        self.__class__.waiters.add(self)

    @classmethod
    def brocast(cls, message):
        logging.info("sending message to %d waiters", len(cls.waiters))
        for waiter in cls.waiters:
            try:
                waiter.write_message(message)
            except Exception:
                logging.error("Error sending message", exc_info=True)

    @classmethod
    def define_route(cls, routers):
        cls.routers.update(routers)


class ServerHandler(WsHandler):
    waiters = set([])
    routers = {}

    @gen.coroutine
    def on_message(self, message):
        logging.info("got message %r", message)
        message_json = tool.json_load(message)

        res_data = None
        try:
            func = self.__class__.routers.get(message_json.get("type"))
            if func:
                result = yield func(self, message_json["data"])
                res_data = {"type": "init", "desc": "success", "data": result}
            else:
                res_data = {"code": 404, "desc": "No message type %s " % message_json.get("type"), "data": message}
        except Exception as e:
            res_data = {"code": 500, "desc": str(e), "data": None}

        self.write_message(res_data)
