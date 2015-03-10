from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.script import Manager
from flask.ext.migrate import Migrate, MigrateCommand
from flask_mail import Mail
from flask.ext.security import Security, SQLAlchemyUserDatastore

# init app
app = Flask(__name__)
app.config.from_object('config')

# setup DB
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# setup DB migrations and ./manage.py tools
manager = Manager(app)
manager.add_command('db', MigrateCommand)

mail = Mail(app)

# import models (only after the DB and everything has happened!)
from app import models

# link user_store for login
user_datastore = SQLAlchemyUserDatastore(db, models.User, models.Role)
security = Security(app, user_datastore)


@app.before_first_request
def ensure_roles():
    for rolename in ["admin", "moderator"]:
        user_datastore.find_or_create_role(rolename)

if app.debug:
    # Create a user to test with
    @app.before_first_request
    def create_user():
        if user_datastore.get_user('reviewer@example.org'): return
        user_datastore.create_user(
            email='reviewer@example.org', password='password')
        user_datastore.add_role_to_user(
            user_datastore.create_user(
                email='moderator@example.org',
                password='password'),
            user_datastore.find_role("moderator"))
        user_datastore.add_role_to_user(
            user_datastore.create_user(
                email='admin@example.org',
                password='password'),
            user_datastore.find_role("admin"))

# this defines all the views
# they rely on things everywhere, do this last!
from app import views

