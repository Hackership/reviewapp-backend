# -*- coding: utf-8 -*-
import urllib2
import urllib
import json
import random

postData = {"Name":"GUI Michael",
            "Other contacts":"Skype - GUIDO\nFacebook - https://www.facebook.com/ccken",
            "Links":"LinkedIn - https://il.linkedin.com/pub/gidken/4b/b64/5b4\nA website I created a few months ago - http://example.com/\nMy musical adventure - https://www.youtube.com/watch?v=hK9jdDM0u8Y",
            "Where did you hear about us?":"I was searching for a coding school to upgrade my programming skills and I came across a link in a ü random blog",
            "Confidential Medical Information: This will not go to our reviewing panel ":"nope",
            "Cost ":"Berlin Earlybird 2450 Euro (Only for applications before 15th April, while availability lasts.)",
            "Date of Birth":"1983-03-24",
            "Skill Level":"4",
            "Background and Motivation":"Hi, I have a dedegree.",
            "Hacking task":"for (var i=1;i<101;i++) {\n    if (i%5 == 0 && i%3 == 0) {\n        console.log('HackerShip')\n    }\n    else if (i%3 == 0) {\n        console.log('Hacker');\n    } \n    else if (i%5 == 0) {\n        console.log('Ship')\n    }\n    else {\n        console.log(i)\n    }\n}",
            "Learning Focus":"I would like to learn fullstack javascript development .",
            "Project Idea":"I would like to build a platform for musicians that allo",
            "Job":"No, thanks, I'm covered",
            "If you are looking for future work, which type interests you most? ":"Starting my own Company",
            "Tuition Fees":["Yes, I accept these conditions"],
            "Aware":["Yes, I am aware of the details, am available and want to participate."],
            "Comments":"",
            "batch":"15-07-BER",
            "_token":"THINGY"}

# postData = {"Name":"Gidon Schocken","Email":"gidonschocken@gmail.com","Other contacts":"Skype - gid0nsch0cken\nFacebook - https://www.facebook.com/gidon.schocken","Links":"LinkedIn - https://il.linkedin.com/pub/gidon-schocken/4b/b63/5b4\nA website I created a few months ago - http://maschinedigest.com/\nMy musical adventure - https://www.youtube.com/watch?v=hK9wdDM0u8Y","Where did you hear about us?":"I was searching for a coding school to upgrade my programming skills and I came across a link in a random blog","Confidential Medical Information: This will not go to our reviewing panel ":"nope","Cost ":"Berlin Earlybird 2450 Euro (Only for applications before 15th April, while availability lasts.)","Date of Birth":"1983-03-24","Skill Level":"4","Background and Motivation":"Hi, I have a degree in music production. My programming experience is self-taught through several courses (edX, RefactorU, Code Academy, Coursera etc.). For the past two years i've been working as a web developer in a startup company using Angular, Node, Javascript, Jquery, Html, Css, Git, a bit of Java and whatever else was thrown at me like Facebook plugins, chrome extensions, elastic search etc. Although I gained considerable development knowledge and practice during the past two years, I feel that I need more than on-the-job-training. In particular I work in a small group, and I think that by not being exposed to more developers and different problems I am missing out. I’m planning to dive into full stack javascript development by building an idea of mine which aims to be a platform where music producers can share unused samples and tracks with each other. I think that by working on this project in the environment that Hackership provides will upgrade my programming skills substantially.","Hacking task":"for (var i=1;i<101;i++) {\n    if (i%5 == 0 && i%3 == 0) {\n        console.log('HackerShip')\n    }\n    else if (i%3 == 0) {\n        console.log('Hacker');\n    } \n    else if (i%5 == 0) {\n        console.log('Ship')\n    }\n    else {\n        console.log(i)\n    }\n}","Learning Focus":"I would like to learn fullstack javascript development and deployment techniques. Mainly to take an idea, build it from scratch, deploy and maintain it. Also I would like to deepen my javascript knowledge, improve my programming skills. In terms of technology node.js really interests me on the back end, on the front end I know Angular pretty good, but I would actually like to try to build my project without a front end framework, just so that I can improve my javascript skills.","Project Idea":"I would like to build a platform for musicians that allows them to upload their unused tracks and samples and share them with each other. Kind of like a music recycling community :)","Job":"No, thanks, I'm covered","If you are looking for future work, which type interests you most? ":"Starting my own Company","Tuition Fees":["Yes, I accept these conditions"],"Aware":["Yes, I am aware of the details, am available and want to participate."],"Comments":"","batch":"15-07-BER","_token":"HS_PROD_THINGY"}

ENDPOINT = "http://localhost:5000/applications/new"


def run():
    rand = random.random()
    postData["Email"] = "asd{}@example.org".format(rand)
    postData["Name"] += "-{}".format(rand)
    print(urllib2.urlopen(ENDPOINT,
            urllib.urlencode({"_token":"THINGY",
                              # "_skip_email": 1,
                              "payload": json.dumps(postData)})).read())

    return postData["Email"]
if __name__ == "__main__":
    run()