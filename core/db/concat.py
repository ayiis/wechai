#!/usr/bin/env python
# -*- coding: utf-8 -*-

import tornado.gen
from common import my_mongodb


@tornado.gen.coroutine
def contact_list_query(self, req_data):

    db_result, result_count = yield [
        my_mongodb.DBS["db_wechai"].contact.find({}).to_list(length=None),
        my_mongodb.DBS["db_wechai"].contact.count_documents({})
    ]

    raise tornado.gen.Return((db_result, result_count))
