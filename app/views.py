# -*- coding: utf-8 -*-
from flask.ext.security import login_required, roles_accepted, current_user
from flask.ext.security.utils import encrypt_password

from app import app, db, mail, user_datastore
from app.schemas import (users_schema, me_schema, admin_app_state, app_state,
                         AnonymousApplicationSchema, ApplicationSchema)
from app.models import User, Application, Email, Comment, REVIEW_STAGES
from app.utils import generate_password, send_email

from datetime import datetime

from flask import (Flask, session, redirect, url_for, escape,
                   request, jsonify, render_template, abort)

from functools import wraps

import logging
import random
import json
import re


def _select_reviewers():
    # Find review only status
    reviewers = User.query.outerjoin("roles"
                         ).filter(User.roles == None).all()
                # ).filter(User.status == 'active'

    random.shuffle(reviewers)

    return reviewers[:2]   # fetches a random two reviewers


def with_application_at_stage(stages):
    if isinstance(stages, basestring):
        stages = [stages]

    def outerwrap(func):
        @wraps(func)
        def innerwrap(id, *args, **kwargs):
            application = db.session.query(Application).get(id)
            if not application:
                abort(404, "Application Not Found")
            if application.stage not in stages:
                abort(400, "Not at right stage")
            return func(application, *args, **kwargs)
        return innerwrap
    return outerwrap


def with_application(func):
    @wraps(func)
    def wrapper(id, *args, **kwargs):
        application = db.session.query(Application).get(id)
        if not application:
            abort(404, "Application Not Found")
        return func(application, *args, **kwargs)
    return wrapper


def _render_application(application):
    schema = AnonymousApplicationSchema()
    if current_user.has_role("admin"):
        schema = ApplicationSchema()
    return jsonify({"application": schema.dump(application).data})


@app.route('/')
@login_required
def index():
    return app.send_static_file('index.html')


@app.route('/api/app_state')
@login_required
def get_state():
    schema = app_state
    query = Application.query.filter(Application.stage in REVIEW_STAGES)
    if current_user.has_role('admin'):
        schema = admin_app_state
        query = Application.query

    if not current_user.has_role('admin') and not current_user.has_role('moderator'):
        query = filter(lambda app: app.stage in REVIEW_STAGES, current_user.applications)
    else:
        query = query.all()

    return jsonify(schema.dump({"user": current_user._get_current_object(),
                                "applications": query}).data)


@app.route('/application/<id>/move_to_stage/in_review', methods=['POST'])
@login_required
@roles_accepted('admin')
@with_application_at_stage("incoming")
def switch_to_review(application):
    anon_content = (request.form.get("anon_content") or request.args.get("anon_content")) or None
    if anon_content:
        application.anon_content = anon_content
    application.anonymizer = current_user._get_current_object().id
    application.members = _select_reviewers()
    application.stage = "in_review"
    application.changedStageAt = datetime.now()
    db.session.add(application)
    db.session.commit()

    # Email Reviewers
    application.send_email('New Application to review',
                           render_template("emails/reviewer/new_application.md", app=application),
                           map(lambda x: x.email, application.members))

    return _render_application(application)


@app.route('/application/<id>/move_to_stage/email_send', methods=['POST'])
@login_required
@roles_accepted('moderator', 'admin')
@with_application_at_stage("in_review")
def switch_to_email_send(application):
    email = (request.form.get("email") or request.args.get("email")) or None
    if not email:
        abort(400, "Missing email")

    content = render_template("emails/applicant/questions.md",
                              app=application,
                              content=email)

    email = Email(author=current_user._get_current_object().id,
                  content=content,
                  incoming=False,
                  stage=application.stage,
                  application=application.id,
                  anon_content=email)

    application.stage = "email_send"
    application.changedStageAt = datetime.now()

    db.session.add(email)
    db.session.add(application)

    # Email Reviewers
    application.send_email('Your application to Hackership', content)

    db.session.commit()
    return _render_application(application)


@app.route('/application/<id>/comment', methods=['POST'])
@login_required
@with_application
def add_comment(application):
    content = request.form.get("comment") or request.args.get("comment")
    if not content:
        abort(400, "Please pass a comment")
    # FIXME verification would be great...
    comment = Comment(content=content,
                      question=request.form.get("question", False),
                      author=current_user.id,
                      application=application.id,
                      stage=application.stage)

    db.session.add(comment)
    db.session.commit()

    # email to other reviewers or moderator?

    return _render_application(application)


@app.route('/application/update', methods=['POST'])
@login_required
def update_application():
    req = request.get_json()
    app = req['application']

    application = Application.query.find_by(id=app['id'])
    #Renew application


@app.route('/applications/new', methods=['POST'])
def new_application():
    if not request.form['_token'] == app.config.get("SCHEMA_TOKEN"):
        return jsonify(success=False)

    form = json.loads(request.form['payload'])

    grant = 'Applying for a Programme Fee Grant' in form

    grant_content = ""
    if grant:
        grant_content = render_template("forms/grant_content.md", app=form)

    content = render_template("forms/content.md", app=form)

    anon = render_template("forms/content_anon.md", app=form)

    application = Application(name=form['Name'],
                              email=form['Email'],
                              content=content,
                              anon_content=anon,
                              fizzbuzz=form['Hacking task'],
                              stage="incoming",
                              batch=form['batch'],
                              grant=grant,
                              changedStageAt=datetime.now(),
                              grant_content=grant_content,
                              createdAt=datetime.now())

    db.session.add(application)
    db.session.commit()

    # E-mail Applicant
    if not request.form.get('_skip_email', False):
        application.send_email('Application Received',
                               render_template("emails/applicant/received.md",
                                               app=application).encode("utf-8"))

    return jsonify(success=True)


EMAIL_MATCHER = re.compile("appl-15([\d]+)@.*")


class BounceError(Exception):
    def __init__(self, msg):
        self.msg = msg


def _handle_email(email):
    email_addr = email["email"]
    match = EMAIL_MATCHER.match(email_addr)
    if not match:
        app.logger.warning("Weird email received: {}".format(email))
        return

    application = Application.query.get(int(match.group(1)))
    if not application:
        raise BounceError("Application not found")

    sender = email['from_email'].strip().lower()

    if application.email.lower() == sender:
        db_mail = Email(incoming=True,
                        stage=application.stage,
                        application=application.id,
                        content=email["text"])

        if application.stage == 'email_send':
            application.stage = "reply_received"
            db.session.add(application)

        db.session.add(db_mail)
        db.session.commit()

        return

    user = User.query.filter(User.email == sender).first()
    if not user:
        raise BounceError("User unknown")

    comment = Comment(author=user.id,
                      application=application.id,
                      stage=application.stage,
                      content=email["text"])
    db.session.add(comment)
    db.session.commit()


@app.route('/email/incoming', methods=['POST'])
def incoming_email():
    events = request.form.get("mandrill_events")

    if not events:
        return

    events = json.loads(events)

    for event in events:
        if event["event"] != "inbound":
            continue
        try:
            _handle_email(event["msg"])
        # except BounceError as exc:
        except Exception as exc:
            app.logger.warning("Problem parsing email {}: {}({})".format(event, type(exc), exc))

    return ""


@app.route('/reviewer/new', methods=['POST'])
@login_required
@roles_accepted('admin')
def add_reviewer():
    req = request.get_json()

    password = generate_password()
    user = user_datastore.create_user(name=req['name'],
                                      email=req['email'],
                                      status="active",
                                      password=encrypt_password(password))
    if 'role' in req:
        user_datastore.add_role_to_user(user, req['role'])

    #Email Reviewer
    send_email("Welcome to the Hackership Review Panel",
               render_template("emails/reviewer/added.md",
                               username=user.email,
                               password=password,
                               name=user.name),
               [user.email])


    user_datastore.commit()

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
