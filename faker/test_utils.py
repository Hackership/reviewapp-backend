
import urllib
import urllib2
import re

from cookielib import CookieJar


def get_logged_in_opener(email):
    cj = CookieJar()
    opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))
    # input-type values from the html form
    formdata = { "email" : email,
                 "password": "password"}
    response = opener.open("http://localhost:5000/login")
    content = response.read()
    formdata['csrf_token'] = re.findall('csrf_token.*?value=\"(.*?)\"', content)[0]

    print(opener.open("http://localhost:5000/login", urllib.urlencode(formdata)).read())
    return opener

