#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import tornado
import tornado.gen
import re, traceback
import os


@tornado.gen.coroutine
def contact_list_query(self, req_data):

    sql_result, result_count = yield [
        self.settings["db_wechai"].room.find({}).to_list(length=None),
        self.settings["db_wechai"].room.count_documents({})
    ]

    raise tornado.gen.Return((sql_result, result_count))
