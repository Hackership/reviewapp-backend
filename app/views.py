
from flask.ext.security import login_required, roles_accepted, current_user
from flask_mail import Message

from app import app, db, mail, user_datastore
from app.schemas import users_schema, me_schema
from app.models import User, Application, Email
from app.utils import generate_password


from flask import (Flask, session, redirect, url_for, escape,
                   request, jsonify)

import logging


def send_email(recipients, subject, content, sender=None):
    if sender is None:
        sender = "no-reply@review.hackership.org"
    msg = Message(subject, recipients=recipients, sender=sender)
    msg.body = content
    mail.send(msg)


def email_applicant(app_id, subject, content, recipient):
    sender = 'appl-15{}@review.hackership.org'.format(app_id)
    recipients = [recipient]
    send_email(recipients, subject, content, sender)


def select_reviewers():
    reviewers = User.query.filter(User.status == 'active').limit(2).all()

    return reviewers



#APPLICATIONS
def parse_application(app):
    cost = app['Cost ']
    back = app['Background and Motivation']
    job = app['Job']
    proj = app['Project Idea']
    focus = app['Learning Focus']
    name = app['Name']
    email = app['Email']
    fizz = app['Hacking task']
    batch = app['batch']
    links = app['Links']
    comments = app['Comments']
    grant = 'Applying for a Programme Fee Grant' in app

    grant_content = ""
    if grant:
        honesty = app["Declaration of Honesty"]
        conf = app["Confirmation of Place"]
        nxt_steps = app["Next Steps"]
        strings = app["Strings Attached to the Grant"]
        decl = app["Statement from you."]
        elig = app["Eligibility to Apply"]
        fin = app["Financial Information"]
        outgoings = app["Outgoings, Living Costs"]
        dep = app["Dependents"]
        other = app["Other Outgoings"]

        grant_content = """##Statement:{} \n ##Eligibility:{}
\n ##Honesty: {} \n ##Confirmatin: {} \n ##Next Steps: {}
\n ##Strings Attached: {} \n 
##Financial: {}, \n ###Outgoings: {}, \n ###Dependents: {} \n##Other: {}
""".format(decl, elig, honesty, conf, nxt_steps, strings, fin, outgoings, dep, other)

    content = """##Background: {}\n ##Learning Focus: {}\n ##Project: {}\n 
##Cost: {}\n ##Job: {}\n ##Links: {}\n ##Comments:{}
""".format(back, focus, proj, cost, job, links, comments)
    
    anon = "##Background: {} ##Learning Focus: {} ##Project: {}".format(back, focus, proj)

    application = Application(name=name, email=email, content=content,
                              anon_content=anon, fizzbuzz=fizz,
                              stage="to_anon", batch=batch, grant=grant,
                              grant_content=grant_content)

    return application


@app.route('/')
@app.route('/ping')
@login_required
def index():
    return "pong"


@app.route('/test/email')
def test_email():
    content = """Dear {},\n\nThank you for applying to Hackership.
We will get back to you within 2 weeks!
\n\nGreetings,\nthe Hackership Team""".format('Anouk')

    email_applicant('202', 'Application Received', content,
                    'anoukruhaak@gmail.com')
    return


@app.route('/applications/all', methods=['GET'])
@login_required
def get_applications():

    applications = Application.query.all()
    return applications


@app.route('/application/update', methods=['POST'])
@login_required
def update_application():
    req = request.get_json()
    app = req['application']

    application = Application.query.find_by(id=app['id'])
    #Renew application


@app.route('/application/email/', methods=['POST'])
@login_required
@roles_accepted('admin', 'moderator')
def follow_up_email():

    req = request.get_json()
    app_id = req['application_id']
    content = req['content']
    recipient = req['email']

    email_applicant(app_id, 'Hackership Follow-Up', content, recipient)
    return jsonify(success=True)


@app.route('/applications/new', methods=['POST'])
def new_application():
    req = request.get_json()
    if (req['_token'] == 'THINGY'):
        application = parse_application(req)
        application.members = select_reviewers()
        db.session.add(application)
        db.session.commit()
        
        email_content = """Dear {},\n\nThank you for applying to Hackership.
We will get back to you within 2 weeks!
\nGreetings,\nthe Hackership Team""".format(application.name)
        
        #E-mail Applicant
        email_applicant(application.id, 'Application Received',
                        email_content, 'EMAIL_APPLICANT')

        #Email Reviewers
        send_email(map(lambda x: x.email, application.members),
                   'TEST New Application',
                   'TESTING You have a new application waiting for review!')

    return jsonify(success=True)


@app.route('/reviewer/new', methods=['POST'])
@login_required
@roles_accepted('admin')
def add_reviewer():
    print('HELLO')
    req = request.get_json()

    password = generate_password()

    user = user_datastore.create_user(name=req['name'],
                                      email=req['email'],
                                      status="active",
                                      password=password)
    if 'role' in req:
        user_datastore.add_role_to_user(user, req['role'])

    email_content = """Thank you for helping us review applications!\n
Please head over to http://review.hackership.org
and login with username: {} and password:{}
\nThank you,\n the Hackership Team""".format(user.email, password)
    
    print(user.email)
    #Email Reviewer
    send_email([user.email], "Welcome to the Hackership Review Panel",
               email_content)

    return jsonify(success=True)


## Generic API

@app.route('/api/user/me', methods=['GET'])
@login_required
def me():
    return jsonify(me_schema.dump(current_user._get_current_object()).data)

@app.route('/api/users', methods=['GET'])
@login_required
def userlist():
    return jsonify({"users": users_schema.dump(User.query.all()).data})
