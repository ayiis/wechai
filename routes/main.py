#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
from tornado import websocket, ioloop, gen
import time
import datetime
import traceback
from common import tool

from routes import (
    friend_manage,
    group_manage,
    login_manage,
    message_manage,
)

class Main(object):
    """docstring for Main"""
    def __init__(self, conf):
        super(Main, self).__init__()
        self.conf = conf
        self.stop = False

        self.friend_manage = friend_manage.FriendManage(conf)
        self.group_manage = group_manage.GroupManage(conf)
        self.login_manage = login_manage.LoginManage(conf)
        self.message_manage = message_manage.MessageManage(conf)

    @gen.coroutine
    def connect(self):
        while True:
            try:
                self.conf["ws_conn"] = yield websocket.websocket_connect(self.conf["url"])
            except Exception as e:
                print datetime.datetime.now(), "websocket_connect Failed:", e
            else:
                print "connect success..."
                self.conf["ws_conn"].on_message = self.on_message
                self.conf["ws_conn"].on_connection_close = self.on_connection_close
                break
            yield gen.sleep(1.0)

    def on_any_request(self):
        pass

    @gen.coroutine
    def on_message(self, message):
        print "on_message:", type(message), message

        try:
            if message is None:
                self.conf["db_wechai"]["any_message"].insert_one({
                    "bg-ts": time.time(),
                    "errno": 1,
                    "type": "connection-closed"
                })
                self.on_connection_close("detected.")
            else:

                try:
                    json_message = tool.json_load(message)
                    assert isinstance(json_message.get("data"), dict)
                except Exception as e:
                    json_message = {
                        "errno": 2,
                        "type": "message",
                        "text": message,
                        "data": {},
                    }
                json_message["bg-ts"] = time.time()

                try:
                    yield self.conf["db_wechai"]["any_message"].insert_one(json_message)
                except Exception as e:
                    print traceback.format_exc()

                try:
                    if json_message["data"].get("self") is False:
                        message_type = json_message["data"].get("room") and "room-message" or "message"
                        to_id = json_message["data"].get("room") or json_message["data"]["from"]

                        res_message = {
                            "type": message_type,
                            "to_id": to_id,
                            "text": "%s (%s) said %s at %s" % (
                                json_message["data"].get("from_nick"),
                                json_message["data"]["from"],
                                json_message["data"]["text"],
                                json_message["data"]["date"]
                            ),
                        }
                        print "res_message:", res_message
                        self.conf["ws_conn"].write_message(tool.json_stringify(res_message))
                except Exception as e:
                    print traceback.format_exc()


        except Exception as e:
            print traceback.format_exc()

    def write_message(self, message):
        return self.conf["ws_conn"].write_message(tool.json_stringify(message))

    @gen.coroutine
    def on_connection_close(self, message):
        """TODO"""
        """TODO"""
        """TODO"""
        print "on_close:", message
        yield self.connect()
