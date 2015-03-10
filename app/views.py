from app import app, db, mail, user_datastore
from app.models import User, Application, Email
from app.utils import generate_password

from flask.ext.security import login_required, roles_accepted
from flask_mail import Message

from flask import (Flask, session, redirect, url_for, escape,
                   request, jsonify)

import logging

SUCCESS = jsonify(success=True)


def send_email(recipients, subject, content, sender=None):
    if sender is None:
        sender = "no-reply@review.hackership.org"
    msg = Message(content, recipients=recipients, sender=sender)
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
    grant = 'Applying for a Programme Fee Grant' in app

    content = """##Background: {} ##Learning Focus: {} ##Project: {} 
##Cost: {} ##Job: {} ##Links: {}""".format(back, focus, proj, cost, job, links)
    anon = "##Background: {} ##Learning Focus: {} ##Project: {}".format(back, focus, proj)

    application = Application(name=name, email=email, content=content,
                              anon_content=anon, fizzbuzz=fizz, stage="to_anon", batch=batch, grant=grant)

    return application


@app.route('/')
@app.route('/ping')
@login_required
def index():
    return "pong"


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
    return SUCCESS


@app.route('/applications/new', methods=['POST'])
def new_application():
    req = request.get_json()
    if (req['_token'] == 'THINGY'):
        application = parse_application(req)
        application.members = select_reviewers()
        db.session.add(application)
        db.session.commit()
    
        #E-mail Applicant
        email_applicant(application.id, 'Application Received',
                        'Dear {}, \n Thank you for applying to Hackership. \
                        \n We will get back to you within 2 weeks! \
                        \n Greetings, \n \
                        the Hackership Team'.format(application.name),
                        'anoukruhaak@gmail.com')

        #Email Reviewers
        send_email(map(lambda x: x.email, application.members),
                   'TEST New Application',
                   'TESTING You have a new application waiting for review!')

    return SUCCESS


@app.route('/reviewer/new', methods=['GET'])
@login_required
@roles_accepted('admin')
def add_reviewer():
    req = request.get_json()
    rev = req['reviewer']

    password = generate_password()

    user = user_datastore.create_user(name=rev['name'],
                email=rev['email'], password=password)
    #Email Reviewer
    send_email(user.email, "Welcome to the Hackership Review Panel",
               "Thank you for helping us review applications! \
        Please head over to http://review.hackership.org \
        and login with username: {} and password: \
        {}".format(user.email, password))
    return SUCCESS


