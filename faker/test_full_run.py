import os.path
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.models import Application
from app import db
from test_post import run as post
from test_inbound_email import run as inbound_email

import urllib
import urllib2
import re

from cookielib import CookieJar

# let's start by logging in


cj = CookieJar()
opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))
# input-type values from the html form
formdata = { "email" : "admin@example.org",
             "password": "password"}
data_encoded = urllib.urlencode(formdata)
response = opener.open("http://localhost:5000/login")
content = response.read()
formdata['csrf_token'] = re.findall('csrf_token.*?value=\"(.*?)\"', content)[0]

print(opener.open("http://localhost:5000/login", urllib.urlencode(formdata)).read())



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

next_stage(application, 'email_send', email="here is a question for you {}".format(email))

inbound_email(from_email=email,
              email=target_email,
              text="I am super qualified")


inbound_email(from_email=email,
              email=target_email,
              text="Wanted to add: I am super qualified. REALLY")

anon_emails = dict([(str(x.id), "anon email {}".format(x.id)) for x in application.emails])

next_stage(application, 'review_reply', **anon_emails)

next_stage(application, 'schedule_skype')



