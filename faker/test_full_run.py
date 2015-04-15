import os.path
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.models import Application
from app import db
from test_commenting import post_comment, post_question
from test_post import run as post
from test_skype_scheduler import random_schedule
from test_inbound_email import run as inbound_email
from test_utils import get_logged_in_opener

import urllib
import urllib2
import re

opener = get_logged_in_opener("admin@example.org")

# FIXME this should become a real unittest test suite soon

def next_stage(application, stagename, **arguments):
    target = "http://localhost:5000/application/{}/move_to_stage/{}".format(application.id, stagename)
    print target
    print(opener.open(target, urllib.urlencode(arguments)).read())


email = post()
application = Application.query.filter(Application.email == email).first()
target_email = "appl-15{}@review.hackership.org".format(application.id)

next_stage(application, 'in_review', anon_content="Anon content for {}".format(email))

inbound_email(from_email='reviewer@example.org',
              email=target_email,
              text="I like this application")

# let's comment around
post_comment(application)
post_question(application)
post_question(application)

next_stage(application, 'email_send', email="here is a question for you {}".format(email))

inbound_email(from_email=email,
              email=target_email,
              text="I am super qualified")


inbound_email(from_email=email,
              email=target_email,
              text="Wanted to add: I am super qualified. REALLY")

anon_emails = dict([(str(x.id), "anon email {}".format(x.id)) for x in application.emails])

next_stage(application, 'review_reply', **anon_emails)

post_comment(application)

next_stage(application, 'schedule_skype')

slot = random_schedule(application)

# fetch it again, check some values
application = Application.query.filter(Application.email == email).first()

assert len(application.comments) == 5, "Comments/Email comments are broken"
assert len(application.emails) == 3, "Comments/Email comments are broken"
assert application.stage == "skype_scheduled", "Scheduling didn't work"
assert len(application.calls) == 1, "Scheduling didn't work"
application.calls[0].scheduledAt.isoformat().replace("T", " ") == slot, "Slot scheduling went wrong"

print " ALL WENT WELL, WOHOOOOOOOO!"





