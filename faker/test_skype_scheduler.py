# -*- coding: utf-8 -*-
from __future__ import with_statement
import urllib2
import urllib
import json
import random
import base64
from app.views import get_hmac
from app import app

skypes = ["adsdead", "asdieja", "899amdjd8a", "923mzmnd8f"]

ENDPOINT = "http://localhost:5000/api/available_slots"
POSTPOINT = "http://localhost:5000/application/{}/schedule/{}"


def random_schedule(application):
    slots = json.loads(urllib2.urlopen(ENDPOINT).read())
    if not slots:
        raise ValueError("No Skype Slots found to select")

    slot = random.choice(slots["slots"])
    with app.app_context():
        key = base64.b64encode(get_hmac(application.email))
    skypename = random.choice(skypes)

    urllib2.urlopen(POSTPOINT.format(application.id, key),
                    urllib.urlencode({"slot": slot, "skype": skypename})
                    ).read()

    return slot
