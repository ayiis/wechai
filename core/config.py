#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

SYSTEM = {
    "listening_port": 8081,
    "ws_for_wechaty_port": 8181,
    "ws_for_server_port": 8182,
}

MONGODB = {
    "db_wechai": {
        "HOST": "192.168.2.102",
        "PORT": 27017,
        "DATABASE_NAME": "wechai",
        "USERNAME": "",
        "PASSWORD": "",
    },
}

API = {
    "send_any_message": "http://127.0.0.1:8081/api/send_any_message"
}
