#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
""" MONGODB 数据库连接 """

import tornado.gen
from motor.motor_tornado import MotorClient

DBS = {}


@tornado.gen.coroutine
def init(mongodb_config):
    try:
        authenticate_list = []

        for db_name in mongodb_config:
            db = mongodb_config[db_name]
            DBS[db_name] = MotorClient(db["HOST"], db["PORT"])[db["DATABASE_NAME"]]

            if db.get("USERNAME") and db.get("PASSWORD"):
                authenticate_list.append(DBS[db_name].authenticate(db["USERNAME"], db["PASSWORD"]))

            setattr(
                DBS[db_name],
                "get_next_sequence",
                lambda sequence_name, db_name=db_name: get_next_sequence(DBS[db_name], sequence_name)
            )

        yield authenticate_list
    except Exception:
        import traceback
        print traceback.format_exc()
    else:
        raise tornado.gen.Return(DBS)


@tornado.gen.coroutine
def get_next_sequence(dbname, sequence_name):
    doc = yield dbname.sequence_counters.find_and_modify(
        query={"_id": sequence_name},
        update={"$inc": {"sequence_value": 1}},
        upsert=True
    )
    if doc is None:
        doc = {"sequence_value": 0}

    raise tornado.gen.Return(str(doc["sequence_value"]))


if __name__ == '__main__':
    from tornado import ioloop

    @tornado.gen.coroutine
    def test():
        mongodbs = yield init({
            "db_wechai": {
                "HOST": "192.168.2.102",
                "PORT": 27017,
                "DATABASE_NAME": "wechai",
                "USERNAME": "",
                "PASSWORD": "",
            },
        })

        print "mongodbs:", mongodbs

        print "db_wechai:", mongodbs["db_wechai"]

        print "test_ms:", mongodbs["db_wechai"]["test_ms"]

        result = yield mongodbs["db_wechai"].test_ms.find({
            # "test": 1
        }).to_list(length=None)

        print dir(mongodbs["db_wechai"].test_ms)
        '''
            'aggregate',
            'aggregate_raw_batches',
            'bulk_write',
            'codec_options',
            'count_documents',
            'create_index',
            'create_indexes',
            'database',
            'delegate',
            'delete_many',
            'delete_one',
            'distinct',
            'drop',
            'drop_index',
            'drop_indexes',
            'estimated_document_count',
            'find',
            'find_one',
            'find_one_and_delete',
            'find_one_and_replace',
            'find_one_and_update',
            'find_raw_batches',
            'full_name',
            'get_io_loop',
            'index_information',
            'inline_map_reduce',
            'insert_many',
            'insert_one',
            'list_indexes',
            'map_reduce',
            'name',
            'options',
            'read_concern',
            'read_preference',
            'reindex',
            'rename',
            'replace_one',
            'update_many',
            'update_one',
            'watch',
            'with_options',
            'wrap',
            'write_concern'
        '''

        result = yield mongodbs["db_wechai"].test_ms.insert_one({
            "test": 1
        })
        print "result:", result

    test()
    ioloop.IOLoop.instance().start()
