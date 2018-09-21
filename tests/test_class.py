#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

import logging


class WsHandler(object):
    # routers = {}

    def __init__(self):
        super(WsHandler, self).__init__()

    def open(self, www):

        print www, self.__class__
        print www, self.__class__.routers
        print

        self.__class__.routers[www] = self

    @classmethod
    def define_route(cls, routers):
        cls.routers.update(routers)


class WechatyHandler(WsHandler):
    routers = {}

    def on_message(self, message):

        print message, self.__class__
        print message, self.__class__.routers
        print


class WechatyHandler2(WsHandler):
    routers = {}

    def on_message(self, message):

        print message, self.__class__
        print message, self.__class__.routers
        print


w1 = WechatyHandler()
w2 = WechatyHandler()
w1.open("w11")
w2.open("w22")
w1.on_message("w111")
w2.on_message("w222")

w1.define_route({"w01": 01})
w2.define_route({"w02": 02})

print WechatyHandler.routers

z1 = WechatyHandler2()
z2 = WechatyHandler2()
z1.open("z11")
z2.open("z22")
z1.on_message("z111")
z2.on_message("z222")

z1.define_route({"z01": 01})
z2.define_route({"z02": 02})

print WechatyHandler2.routers
