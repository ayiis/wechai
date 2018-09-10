#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import tornado
import tornado.gen
import re, traceback
import os

from common import tool


@tornado.gen.coroutine
def message_list_query(self, req_data):
    # result = yield self.settings["db_wechai"].any_message.find({
    #     # "test": 1
    # }).to_list(length=None)

    # print "result:", result

    assert req_data.get("wxid") is not None, "wxid cannot be empty"

    page_size = req_data.get("page_size") or 10
    page_index = req_data.get("page_index") or 1
    page_index = page_index - 1

    req_data = {
        "data.from": req_data["wxid"]
    }

    # for key in ["name", "trigger"]:
    #     if req_data.get(key):
    #         req_data[key] = req_data[key]#.encode("utf8")

    # for key in ["questions", "answers"]:
    #     if req_data.get(key):
    #         req_data[key] = {
    #             "$regex": req_data[key],
    #         }

    print "req_data:", req_data

    db_query = self.settings["db_wechai"].any_message.find(req_data)
    print "db_query:", dir(db_query)

    sql_result = yield db_query.skip(page_size * page_index).limit(page_size).to_list(length=None)
    result_count = 20

    # sql_result, result_count = yield [
    #     db_query.skip(page_size * page_index).limit(page_size).to_list(length=None),
    #     10
    # ]
    sql_result = [x["data"] for x in sql_result]

    raise tornado.gen.Return((sql_result, result_count))


