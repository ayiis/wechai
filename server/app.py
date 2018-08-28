#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# 解决uft-8中文序列化报错的问题
import sys
import os
reload(sys).setdefaultencoding("utf-8")

sys.path.insert(0, os.path.realpath("%s/.." % os.path.dirname(os.path.abspath(__file__))))

import tornado
from tornado import websocket, web, ioloop
from common import websocket_handler


def main():

    settings = {
        "debug": True,
        "autoreload": True,
    }

    web.Application([
        (r"/ws", websocket_handler.DefaultWebsocketHandler),
    ], **settings).listen(8888)
    print "listen(8888)..."


if __name__ == "__main__":
    main()
    ioloop.IOLoop.instance().start()
