# -*- coding: utf-8 -*-
from flask.ext.security import Security, SQLAlchemyUserDatastore
from flask.ext.migrate import Migrate, MigrateCommand
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.script import Manager
from flask import Flask
from celery import Celery

from flask_mail import Mail, email_dispatched

# init app
app = Flask(__name__, static_folder="../assets", static_path="/assets")
app.config.from_object('config')

# setup DB
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# setup DB migrations and ./manage.py tools
manager = Manager(app)
manager.add_command('db', MigrateCommand)

# setup mail
mail = Mail(app)


celery = Celery(app.import_name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)
TaskBase = celery.Task


class ContextTask(TaskBase):
    abstract = True

    def __call__(self, *args, **kwargs):
        with app.app_context():
            return TaskBase.__call__(self, *args, **kwargs)

celery.Task = ContextTask

# import models (only after the DB and everything has happened!)
from app import models

# link user_store for login
user_datastore = SQLAlchemyUserDatastore(db, models.User, models.Role)
security = Security(app, user_datastore)


@app.before_first_request
def ensure_roles():
    for rolename in ["admin", "moderator", "skypelead", "skypee", 'reviewer']:
        user_datastore.find_or_create_role(rolename)

if app.debug:

    # Create a user to test with
    @app.before_first_request
    def create_user():
        if not user_datastore.get_user('reviewer@example.org'):
            user_datastore.add_role_to_user(
                user_datastore.create_user(
                    email='reviewer@example.org', password='password'),
                'reviewer')

        if not user_datastore.get_user('moderator@example.org'):
            user_datastore.add_role_to_user(
                user_datastore.create_user(
                    email='moderator@example.org',
                    password='password'),
                user_datastore.find_role("moderator"))

        if not user_datastore.get_user('admin@example.org'):
            user_datastore.add_role_to_user(
                user_datastore.create_user(
                    email='admin@example.org',
                    password='password'),
                user_datastore.find_role("admin"))

        if not user_datastore.get_user('skypee1@example.org'):

            user_datastore.add_role_to_user(
                user_datastore.create_user(
                    email='skypee1@example.org',
                    password='password'),
                user_datastore.find_role("skypee"))

        if not user_datastore.get_user('skypee2@example.org'):
            user_datastore.add_role_to_user(
                user_datastore.create_user(
                    email='skypee2@example.org',
                    password='password'),
                user_datastore.find_role("skypee"))

        if not user_datastore.get_user('skypee3@example.org'):
            user_datastore.add_role_to_user(
                user_datastore.create_user(
                    email='skypee3@example.org',
                    password='password'),
                user_datastore.find_role("skypee"))
        if not user_datastore.get_user('skypelead@example.org'):
            user_datastore.add_role_to_user(
                user_datastore.create_user(
                    email='skypelead@example.org',
                    password='password'),
                user_datastore.find_role("skypelead"))

        user_datastore.commit()

    def log_message(message, app):
        app.logger.debug(u"Email %s from %s to %s:\n%s\n",
                        message.subject, message.sender,
                        message.recipients, message.body)

    email_dispatched.connect(log_message)

else:

    # log to stderr
    import logging
    from logging import StreamHandler
    file_handler = StreamHandler()
    app.logger.setLevel(logging.INFO)  # set the desired logging level here
    app.logger.addHandler(file_handler)

# this defines all the views
# they rely on things everywhere, do this last!
from app import tasks
from app import views
from app import admin


