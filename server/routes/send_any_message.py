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

    assert req_data.get("type"), "type cannot be empty"
    assert req_data.get("to_id"), "to_id cannot be empty"
    assert req_data.get("text"), "text cannot be empty"

    request_body = {
        "type": req_data["type"],
        "to_id": req_data["to_id"],
        "text": req_data["text"],
    }

    request_body = tool.json_stringify(request_body)
    print "request_body:", request_body

    request = tornado.httpclient.HTTPRequest(
        url=config.API["send_any_message"],
        method="POST",
        headers={
            "Content-Type": "application/json; charset=UTF-8",
        },
        body=request_body,
        connect_timeout=15,
        request_timeout=15
    )

    response = yield async_client.fetch(request, raise_error=False)

    if response.code != 200:
        raise Exception("http status code %s, %s" % (response.code, response.error))

    raise tornado.gen.Return(("success", 1))
