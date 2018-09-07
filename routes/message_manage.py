#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-


class MessageManage(object):
    """docstring for MessageManage"""
    def __init__(self, conf):
        super(MessageManage, self).__init__()
        self.conf = conf

    def send_friend_message(self):
        pass

    def send_group_message(self):
        pass

    def on_friend_message(self):
        pass

    def on_group_message(self):
        pass

    def on_error(self):
        pass
