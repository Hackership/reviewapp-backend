# -*- coding: utf-8 -*-
import urllib2
import urllib

import random
import json

FROM = "asd0.782931682522@gmail.com"

DATA = {
    "attachments": {},
    "cc": [
        ["bob@example.com", "Bob Johnson"]
    ],
    "dkim": {
        "signed": False,
        "valid": False
    },
    "email": "appl-152@review.hackership.org",
    "from_email": FROM,
    "from_name": "John Smith",
    "headers": {
        "Cc": "Bob Johnson <bob@example.com>",
        "Content-Type": "multipart/mixed; boundary=\"51643cec_66ef438d_d22c\"",
        "Date": "Tue, 9 Apr 2013 12:08:12 -0400",
        "From": "John Smith <john@example.com>",
        "Message-Id": "<54C9A31C34DF40409355EC9BB763EF15@example.com>",
        "Mime-Version": "1.0",
        "Received": ["from mail-gh0-f179.google.com (mail-gh0-f179.google.com [209.85.160.179]) by ip-10-254-10-35 (Postfix) with ESMTPS id 255244B40C5 for <testing+123testing@example.com>; Tue, 9 Apr 2013 16:08:20 +0000 (UTC)", "by mail-gh0-f179.google.com with SMTP id z12so1085045ghb.10 for <testing+123testing@example.com>; Tue, 09 Apr 2013 09:08:19 -0700 (PDT)", "from [10.0.0.83] (65-23-202-215.prtc.net. [65.23.202.215]) by mx.google.com with ESMTPS id s45sm43951018yhk.22.2013.04.09.09.08.15 (version=TLSv1 cipher=RC4-SHA bits=128/128); Tue, 09 Apr 2013 09:08:17 -0700 (PDT)"],
        "Subject": "Testing",
        "To": "Testing Staging <testing+123testing@example.com>",
        "X-Gm-Message-State": "",
        "X-Google-Dkim-Signature": "",
        "X-Mailer": "sparrow 1.6.4 (build 1178)",
        "X-Received": "by 10.236.209.67 with SMTP id r43mr16105835yho.197.1365523699219; Tue, 09 Apr 2013 09:08:19 -0700 (PDT)"
    },
    "html": "<p>We no speak americano</p>",
    "raw_msg": "",
    "sender": None,
    "spam_report": {
        "matched_rules": [{
                "description": "RBL: Sender listed at http://www.dnswl.org/, low",
                "name": "RCVD_IN_DNSWL_LOW",
                "score": -0.7
            }, {
                "description": None,
                "name": None,
                "score": 0
            }, {
                "description": "in list.dnswl.org]",
                "name": "listed",
                "score": 0
            }, {
                "description": "Local part of To: address appears in Subject",
                "name": "LOCALPART_IN_SUBJECT",
                "score": 0.7
            }, {
                "description": "BODY: HTML included in message",
                "name": "HTML_MESSAGE",
                "score": 0
            }
        ],
        "score": 0
    },
    "spf": {
        "detail": "sender SPF authorized",
        "result": "pass"
    },
    "subject": "Testing",
    "tags": [],
    "text": "\nThis is awesome!\n\n",
    "to": [
        ["testing+123testing@example.com", "Testing Staging"]
    ]
}

ENDPOINT = "http://localhost:5000/email/incoming"


def run(**updates):
    DATA.update(updates)
    postData = {"mandrill_events":json.dumps([{
        "event": "inbound",
        "ts": 1365523701,
        "msg": DATA}])}
    print(urllib2.urlopen(ENDPOINT, urllib.urlencode(postData)).read())

if __name__ == "__main__":
    run()
