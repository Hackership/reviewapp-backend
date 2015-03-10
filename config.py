import os


basedir = os.path.abspath(os.path.dirname(__file__))

HOSTNAME = os.environ.get("HOSTNAME", "review.hackership.org")
DEBUG = os.environ.get("PRODUCTION", False) is False

SECRET_KEY = os.environ.get("SECRET_KEY", "__DEV")

SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", 'sqlite:///{}'.format(os.path.join(basedir, 'app.db')))
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')

# Flask-Security, For Login-and Such
# see https://pythonhosted.org/Flask-Security/configuration.html

SECURITY_PASSWORD_HASH = "bcrypt"
SECURITY_PASSWORD_SALT = os.environ.get("SECURITY_PASSWORD_SALT", "__DEV")
SECURITY_EMAIL_SENDER = "no-reply@{}".format(HOSTNAME)
SECURITY_REGISTERABLE = False
SECURITY_SEND_REGISTER_EMAIL = False
SECURITY_DEFAULT_REMEMBER_ME = True

try:
    from local_config import *
except ImportError:
    pass


# CONSTRAINS to ensure we are not running with a bad Config
if not DEBUG:
    if SECRET_KEY == "__DEV":
        raise ValueError("You need to set the environment variable 'SECRET_KEY'!")

    if SECURITY_PASSWORD_SALT == "__DEV":
        raise ValueError("You need to set the environment variable 'SECURITY_PASSWORD_SALT'!")



