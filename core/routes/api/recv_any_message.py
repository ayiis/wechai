#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import tornado
import tornado.gen
import re, traceback
import os
import tornado.httpclient

import config
from common import tool

async_client = tornado.httpclient.AsyncHTTPClient(max_clients=1000)


@tornado.gen.coroutine
def do(self, req_data):

    print "req_data:", req_data

    yield self.settings["ws"].write_message(req_data)

    raise tornado.gen.Return(("success", 1))
