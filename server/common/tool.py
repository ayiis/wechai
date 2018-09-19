#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-
import json
import datetime
import time
import decimal
import hashlib
import base64
import zlib

from bson.objectid import ObjectId

import config


class MyEncoder(json.JSONEncoder):

    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            if obj == datetime.datetime.min:
                return None
            else:
                return obj.strftime("%Y-%m-%d %H:%M:%S")
        elif isinstance(obj, datetime.date):
            if obj == datetime.date.min:
                return None
            else:
                return obj.strftime("%Y-%m-%d")
        elif isinstance(obj, datetime.timedelta):
            # hacked
            return time.strftime("%H:%M:%S", time.localtime(obj.seconds + 60 * 60 * (24 - 8)))
        elif isinstance(obj, decimal.Decimal):
            return float(obj)
        # elif isinstance(obj, enum.Enum):
        #     return obj.value
        elif isinstance(obj, Exception):
            return {
                "error": obj.__class__.__name__,
                "args": obj.args,
            }
        elif isinstance(obj, ObjectId):
            return str(obj)
        else:
            return json.JSONEncoder.default(self, obj)


def wrap_unicode(data):
    if isinstance(data, dict):
        return {wrap_unicode(key): wrap_unicode(value) for key, value in data.iteritems()}
    elif isinstance(data, list):
        return [wrap_unicode(element) for element in data]
    elif isinstance(data, unicode):
        return data.encode("utf-8")
    else:
        return data


def json_stringify(data):
    return json.dumps(wrap_unicode(data), cls=MyEncoder, encoding="utf-8", ensure_ascii=False)


def json_load(data):
    re_data = json.loads(data)
    assert isinstance(re_data, (list, dict)), "Not a valid json."
    return wrap_unicode(re_data)


def getMd5Base64(val):
    val = val.encode("utf8")
    hash = hashlib.md5()
    hash.update(val)
    return base64.encodestring(hash.digest()).rstrip()


def get_md5_digest(text):
    return hashlib.md5("%s:%s" % (text, config.SECRET["md5_salt"])).digest()


# BS = 16
def unpad_pkcs5(s):
    return s[0:-ord(s[-1])]


def gzip_decode(g_data):
    return zlib.decompress(g_data, zlib.MAX_WBITS | 32)


# 精确到亿 999999999
def fixed_float(num, fixed=2):
    return round(float("%fe-%s" % (round(float("%fe+%s" % (num, fixed)), 0), fixed)), fixed)
