#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-


class LoginManage(object):
    """docstring for LoginManage"""
    def __init__(self, conf):
        super(LoginManage, self).__init__()
        self.conf = conf

    def on_scan_request(self):
        pass

    def on_login(self):
        pass

    def on_logout(self):
        pass

    def on_error(self):
        pass
