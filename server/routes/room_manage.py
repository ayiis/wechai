#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import tornado
import tornado.gen
import re, traceback
import os

from common import tool


@tornado.gen.coroutine
def room_list_query(self, req_data):

    sql_result, result_count = yield [
        self.settings["db_wechai"].room.find({}).to_list(length=None),
        self.settings["db_wechai"].room.count_documents({})
    ]

    for item in sql_result:
        item["roomid"] = item["wxid"]

    raise tornado.gen.Return((sql_result, result_count))


@tornado.gen.coroutine
def room_message_list_query(self, req_data):

    assert req_data.get("roomid") is not None, "roomid cannot be empty"

    page_size = req_data.get("page_size") or 10
    page_index = req_data.get("page_index") or 1
    page_index = page_index - 1

    req_data = {
        "data.room": req_data["roomid"]
    }

    db_query = self.settings["db_wechai"].any_message.find(req_data)

    sql_result = yield db_query.sort([("bg-ts", -1)]).skip(page_size * page_index).limit(page_size).to_list(length=None)
    result_count = 20

    # sql_result, result_count = yield [
    #     db_query.skip(page_size * page_index).limit(page_size).to_list(length=None),
    #     10
    # ]
    sql_result = [x["data"] for x in sql_result]

    raise tornado.gen.Return((sql_result, result_count))


