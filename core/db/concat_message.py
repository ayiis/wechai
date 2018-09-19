#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import tornado
import tornado.gen
import re
import traceback

from common import tool


@tornado.gen.coroutine
def concat_message_list_query(self, req_data):
    # assert req_data.get("wxid") is not None, "wxid cannot be empty"

    page_size = req_data.get("page_size") or 20
    page_index = req_data.get("page_index") or 1
    page_index = page_index - 1

    req_data = {
        "$or": [{
            "data.from": req_data["wxid"],
        }, {
            "data.to": req_data["wxid"],
        }],
        "data.room": None,
    }

    db_query = self.settings["db_wechai"].concat_message.find(req_data)
    db_result = yield db_query.sort([("bg-ts", -1)]).skip(page_size * page_index).limit(page_size).to_list(length=None)
    result_count = 20   # TODO

    db_result = [x["data"] for x in db_result]

    raise tornado.gen.Return((db_result, result_count))
