# -*- coding: utf-8 -*-
from flask.ext.security import login_required, roles_accepted, current_user

from app import app, db, mail, user_datastore
from app.schemas import users_schema, me_schema, admin_app_state, app_state
from app.models import User, Application, Email, Comment, REVIEW_STAGES
from app.utils import generate_password, send_email
from datetime import datetime

from flask import (Flask, session, redirect, url_for, escape,
                   request, jsonify, render_template)

from functools import wraps


def select_reviewers():
    reviewers = User.query.filter(User.status == 'active').limit(2).all()

    return reviewers




def with_application_at_stage(stages):
    if isinstance(stages, basestring):
        stages = [stages]

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


# @app.route('/application/email/', methods=['POST'])
# @login_required
# @roles_accepted('admin', 'moderator')
# def follow_up_email():

#     req = request.get_json()
#     app_id = req['application_id']
#     content = req['content']
#     recipient = req['email']

#     email_as_app(app_id, 'Hackership Follow-Up',
#                     content, recipient)
#     return jsonify(success=True)


@app.route('/applications/new', methods=['POST'])
def new_application():
    form = request.form
    if not form['_token'] == app.config.get("SCHEMA_TOKEN"):
        return jsonify(success=False)

    grant = 'Applying for a Programme Fee Grant' in form

    grant_content = ""
    if grant:
        grant_content = render_template("forms/grant_content.md", app=form)

    content = render_template("forms/content.md", app=form)

    anon = render_template("forms/content_anon.md", app=form)

    application = Application(name=form['Name'], email=form['Email'],
                              content=content, anon_content=anon,
                              fizzbuzz=form['Hacking task'],
                              stage="incoming", batch=form['batch'],
                              grant=grant,
                              grant_content=grant_content,
                              createdAt=datetime.now())

    db.session.add(application)
    db.session.commit()

    # E-mail Applicant
    application.send_email('Application Received',
                           render_template("emails/applicant/received.md",
                                           app=application))

    return jsonify(success=True)


@app.route('/reviewer/new', methods=['POST'])
@login_required
@roles_accepted('admin')
def add_reviewer():
    req = request.get_json()

    password = generate_password()

    user = user_datastore.create_user(name=req['name'],
                                      email=req['email'],
                                      status="active",
                                      password=password)
    if 'role' in req:
        user_datastore.add_role_to_user(user, req['role'])

    #Email Reviewer
    send_email("Welcome to the Hackership Review Panel",
               render_template("emails/reviewer/added.md",
                               username=user.email,
                               password=password,
                               name=user.name),
               [user.email])

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
