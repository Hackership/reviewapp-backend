# -*- coding: utf-8 -*-
from flask.ext.security import login_required, roles_accepted, current_user
from flask_mail import Message

from app import app, db, mail, user_datastore
from app.schemas import users_schema, me_schema, admin_app_state, app_state
from app.models import User, Application, Email, REVIEW_STAGES
from app.utils import generate_password
from datetime import datetime


from flask import (Flask, session, redirect, url_for, escape,
                   request, jsonify, render_template)

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
    name = app['Name']
    email = app['Email']
    fizz = app['Hacking task']
    batch = app['batch']
    grant = 'Applying for a Programme Fee Grant' in app

    grant_content = ""
    if grant:
        grant_content = render_template("forms/grant_content.md", app=app)

    content = render_template("forms/content.md", app=app)

    anon = render_template("forms/content_anon.md", app=app)

    application = Application(name=name, email=email, content=content,
                              anon_content=anon, fizzbuzz=fizz,
                              stage="incoming", batch=batch, grant=grant,
                              grant_content=grant_content,
                              createdAt=datetime.now())

    return application


@app.route('/')
@login_required
def index():
    return app.send_static_file('index.html')


@app.route('/test/email')
def test_email():
    content = u"""Dear {},\n\nThank you for applying to Hackership.
We will get back to you within 2 weeks!
\n\nGreetings,\nthe Hackership Team""".format('Anouk')

    email_applicant('202', 'Application Received', content,
                    'anoukruhaak@gmail.com')
    return


@app.route('/api/app_state')
@login_required
def get_state():
    schema = app_state
    query = Application.query.filter(Application.stage in REVIEW_STAGES)
    if current_user.has_role('admin'):
        schema = admin_app_state
        query = Application.query

    return jsonify(schema.dump({"user": current_user._get_current_object(),
                                "applications": query.all()}).data)


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
    req = request.form
    if not req['_token'] == app.config.get("SCHEMA_TOKEN"):
        return jsonify(success=False)

    application = parse_application(req)
    application.members = select_reviewers()
    db.session.add(application)
    db.session.commit()

    email_content = u"""Dear {},\n\nThank you for applying to Hackership.
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


##  Generic API

@app.route('/api/user/me', methods=['GET'])
@login_required
def me():
    return jsonify(me_schema.dump(current_user._get_current_object()).data)

@app.route('/api/users', methods=['GET'])
@login_required
def userlist():
    return jsonify({"users": users_schema.dump(User.query.all()).data})
