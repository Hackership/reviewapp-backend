import os
import base64


basedir = os.path.abspath(os.path.dirname(__file__))

HOSTNAME = os.environ.get("APP_HOSTNAME", "review.hackership.org")
DEBUG = os.environ.get("PRODUCTION", False) is False

SECRET_KEY = os.environ.get("SECRET_KEY", "__DEV")

SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", 'sqlite:///{}'.format(os.path.join(basedir, 'app.db')))

if not DEBUG:
    SQLALCHEMY_NATIVE_UNICODE = False

SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')

# Flask-Security, For Login-and Such
# see https://pythonhosted.org/Flask-Security/configuration.html

SECURITY_PASSWORD_HASH = "bcrypt"
SECURITY_PASSWORD_SALT = os.environ.get("SECURITY_PASSWORD_SALT", "__DEV")
SECURITY_EMAIL_SENDER = "no-reply@{}".format(HOSTNAME)
SECURITY_REGISTERABLE = False
SECURITY_SEND_REGISTER_EMAIL = False
SECURITY_DEFAULT_REMEMBER_ME = True

SCHEMA_TOKEN = os.environ.get("SCHEMA_TOKEN", 'THINGY')

MAIL_SERVER = os.environ.get("MAIL_SERVER", "")
MAIL_PORT = int(os.environ.get("MAIL_PORT", 25))
MAIL_USERNAME = os.environ.get("MAIL_USERNAME", "")
MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", "")
MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", SECURITY_EMAIL_SENDER)
MAIL_SUPPRESS_SEND = DEBUG

GDATA_PRIVATE_EMAIL = os.environ.get("GDATA_PRIVATE_EMAIL", "")
GDATA_PRIVATE_KEY = base64.b64decode(os.environ.get("GDATA_PRIVATE_KEY", ""))
GDATA_CALENDAR_ID = os.environ.get("GDATA_CALENDAR_ID", "")

try:
    from local_config import *
except ImportError:
    pass


# CONSTRAINS to ensure we are not running with a bad Config
if not DEBUG:
    if not MAIL_SERVER:
        raise ValueError("You need to set the environment variable 'MAIL_SERVER'!")

    if SECRET_KEY == "__DEV":
        raise ValueError("You need to set the environment variable 'SECRET_KEY'!")

    if SECURITY_PASSWORD_SALT == "__DEV":
        raise ValueError("You need to set the environment variable 'SECURITY_PASSWORD_SALT'!")

    if SCHEMA_TOKEN == "THINGY":
        raise ValueError("You need to set the environment variable 'SCHEMA_TOKEN'!")



