#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

import logging
import tornado.escape
import tornado.ioloop
import tornado.websocket
from tornado import gen
from common import tool

from db import (
    concat,
    concat_message,
    room,
    room_message,
)


class WsHandler(tornado.websocket.WebSocketHandler):
    waiter = set([])

    def get_compression_options(self):
        # Non-None enables compression with default options.
        return {}

    def open(self):
        print "waiters.add:", self
        WsHandler.waiters.add(self)

    def on_close(self):
        print "waiters.remove:", self
        WsHandler.waiters.remove(self)

    @classmethod
    def brocast(cls, message):
        logging.info("sending message to %d waiters", len(cls.waiters))
        for waiter in cls.waiters:
            try:
                waiter.write_message(message)
            except Exception:
                logging.error("Error sending message", exc_info=True)

    @gen.coroutine
    def on_message(self, message):
        logging.info("got message %r", message)
        message_json = tool.json_load(message)

        res_data = None
        try:

            if message_json.get("type") == "init":
                res_data = {"type": "init", "desc": "success"}

            elif message_json.get("type") == "contact.contact_list_query":
                result = yield concat.contact_list_query(self, message_json["data"])
                res_data = {"type": "init", "desc": "success", "data": result}

            elif message_json.get("type") == "contact.concat_message_list_query":
                result = yield concat_message.concat_message_list_query(self, message_json["data"])
                res_data = {"type": "init", "desc": "success", "data": result}

            elif message_json.get("type") == "room.room_list_query":
                result = yield room.room_list_query(self, message_json["data"])
                res_data = {"type": "init", "desc": "success", "data": result}

            elif message_json.get("type") == "room.room_message_list_query":
                result = yield room_message.room_message_list_query(self, message_json["data"])
                res_data = {"type": "init", "desc": "success", "data": result}

            else:
                res_data = {"code": 404, "desc": "No message type %s " % message_json.get("type"), "data": None}

        except Exception as e:
            res_data = {"code": 500, "desc": str(e), "data": None}

        self.write_message(res_data)
