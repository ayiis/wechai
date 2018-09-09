#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import tornado
import tornado.gen
import re, traceback
import os

from common import tool


@tornado.gen.coroutine
def message_list_query(self, req_data):
    result = yield self.settings["db_wechai"].any_message.find({
        # "test": 1
    }).to_list(length=None)

    print "result:", result

    assert req_data.get("contact_id") is not None, "contact_id cannot be empty"

    page_size = req_data.get("page_size") or 10
    page_index = req_data.get("page_index") or 1
    page_index = page_index - 1

    req_data = {
        "contact_id": req_data["contact_id"]
    }

    # for key in ["name", "trigger"]:
    #     if req_data.get(key):
    #         req_data[key] = req_data[key]#.encode("utf8")

    # for key in ["questions", "answers"]:
    #     if req_data.get(key):
    #         req_data[key] = {
    #             "$regex": req_data[key],
    #         }

    db_query = self.collection.find(
        req_data,
        {
         "_id": 0
        }
    )

    sql_result = list(db_query.skip(page_size * page_index).limit(page_size))
    result_count = db_query.count()

    raise tornado.gen.Return(sql_result, result_count)


