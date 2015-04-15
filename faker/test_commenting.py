
from test_utils import get_logged_in_opener

import urllib
import urllib2
import random

opener = get_logged_in_opener("reviewer@example.org")

COMMENTS = [
    "This is a great application",
    "I'd hire them",
    "Looks like a great fit",
    "I am not so sure about them",
]

ENDPOINT = "http://localhost:5000/application/{}/comment"


def post_comment(application, question=False):
    payload = {"comment": random.choice(COMMENTS)}
    if question:
        payload["question"] = True
    opener.open(ENDPOINT.format(application.id), urllib.urlencode(payload)).read()


def post_question(application):
    return post_comment(application, True)
