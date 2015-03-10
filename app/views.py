from app import app, db, mail, login_manager
from app.models import User, Application, Email
from flask.ext.login import login_user, logout_user, current_user, login_required
from flask import Flask, session, redirect, url_for, escape, request, jsonify
from functools import wraps
import logging
from flask_mail import Message


#HELPER FUNCTIONS
def admin_required(func):
    @wraps(func)
    def check_admin(*args, **kwargs):
        if not current_user.is_admin:
            return 401
        return func(*args, **kwargs)
    return check_admin


def moderator_required(func):
    @wraps(func)
    def check_mod(*args, **kwargs):
        if not current_user.is_moderator:
           return 401
        return func(*args, **kwargs)
    return check_mod


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


#LOGIN
@login_manager.user_loader
def load_user(userid):
    return User.get(userid)


@app.route("/login", methods=["POST"])
def login():
    user = User.query.find_by('email' == request.form['email'])

    password = request.form['password'] #TODO: Hash
    if user.password == password:
        login_user(user)
        return {'success': 'true'}
    return {'success': 'false'}


@app.route('/reviewer/logout', methods=['GET'])
@login_required
def logout(request):
    logout_user()
    return


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
def index():
    return "pong"


@app.route('/applications/all', methods=['GET'])
# @login_required
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
@moderator_required
def follow_up_email():

    req = request.get_json()
    app_id = req['application_id']
    content = req['content']
    recipient = req['email']

    email_applicant(app_id, 'Hackership Follow-Up', content, recipient)
    return 'success'


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

    return 'done'


@app.route('/reviewer/new', methods=['POST'])
@login_required
@admin_required
def add_reviewer():
    req = request.get_json()
    rev = req['reviewer']

    password = 'test'
    user = User(name=rev['name'],
                    email=rev['email'],
                    role=rev['role'],
                    password=password)
    db.session.add(user)
    db.session.commit()
    
    #Email Reviewer
    send_email(user.email, "Welcome to the Hackership Review Panel",
               "Thank you for helping us review applications! \
        Please head over to http://review.hackership.org \
        and login with username: {} and password: \
        {}".format(user.email, password))
    return {'success': 'false'}


