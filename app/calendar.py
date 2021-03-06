# -*- coding: utf-8 -*-

from app import app
from apiclient.discovery import build
from httplib2 import Http
from oauth2client.client import SignedJwtAssertionCredentials
from datetime import timedelta

def _get_service():
    auth = "https://www.googleapis.com/auth/calendar"
    credentials = SignedJwtAssertionCredentials(
        app.config.get("GDATA_PRIVATE_EMAIL"),
        app.config.get("GDATA_PRIVATE_KEY"), auth)

    http_auth = credentials.authorize(Http())
    return build('calendar', 'v3', http=http_auth)


def remove_call_from_calendar(eventId):
    if not app.config.get("GDATA_CALENDAR_ID"):
        print ("Google Calendar Disabled. Please add GDATA_CALENDAR_ID to config")
        return

    service = _get_service()

    try:
        return service.events().delete(calendarId=app.config.get("GDATA_CALENDAR_ID"),
                                       sendNotifications=True,
                                       eventId=eventId).execute()
    except Exception, exc:
        print("Well, consider this failed: %r" % exc)


def add_call_to_calendar(call, application):
    if not app.config.get("GDATA_CALENDAR_ID"):
        print ("Google Calendar Disabled. Please add GDATA_CALENDAR_ID to config")
        return

    build = _get_service()

    attendees = [{'email': x.email} for x in call.callers]
    attendees.insert(0, {'email': application.email})

    event = {
        'start': {'dateTime': call.scheduledAt.isoformat() + "+0000"},
        'end': {'dateTime': (call.scheduledAt + timedelta(minutes=30)).isoformat()  + "+0000"},
        'attendees': attendees,
        'location': 'Skype',
        'summary': u'HS Interview {}'.format(application.name),
        'description': u'Skype call with {} Applicant {}({}): {}'.format(
            application.batch, application.name, call.skype_name, application.id)
    }

    return build.events().insert(
        calendarId=app.config.get("GDATA_CALENDAR_ID"),
        sendNotifications=True,
        body=event).execute()['id']
