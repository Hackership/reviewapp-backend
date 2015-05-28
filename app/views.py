# -*- coding: utf-8 -*-

from flask import (request, jsonify, render_template, abort)
from flask.ext.security import login_required, roles_accepted, current_user
from flask.ext.security.utils import get_hmac, encrypt_password

from sqlalchemy.sql import or_, and_
from sqlalchemy.exc import IntegrityError

from app.utils import generate_password, send_email, generate_fancy_name
from app.calendar import add_call_to_calendar, remove_call_from_calendar
from app.models import (User, Application, Email, Comment,
                        Timeslot, ScheduledCall, REVIEW_STAGES)
from app.schemas import (me_schema, admin_app_state, mod_app_state, app_state,
                         AnonymousApplicationSchema, ApplicationSchema,
                         ModeratorApplicationSchema,
                         ExternalApplicationSchema, TimeslotSchema)

from app import app, db, user_datastore

from datetime import datetime, timedelta
from functools import wraps

import base64
import random
import json
import re


def _select_reviewers():
    # Find review only status
    role = user_datastore.find_role('reviewer')
    reviewers = [x for x in role.users]
    random.shuffle(reviewers)

    return reviewers[:2]   # fetches two reviewers at random


def _clean_time(dt):
    return dt.strftime("%Y-%m-%d %H:{}").format((dt.minute / 30 and "30:00" or "00:00"))


def _filter_for_open_slots(users_per_slot, users_map=None):
    if users_map is None:
        users_map = dict([(x.id, x) for x in User.query.all()])

    for key, uids in users_per_slot.iteritems():
        uids = set(uids)
        users = map(lambda x: users_map[x], uids)
        leads = filter(lambda x: x.is_skypelead(), users)
        if len(uids) % 2 == 0 and leads and (float(len(uids)) / len(leads) == 2):
            # we have an evenly distributed slot, ignore
            continue

        yield (key, uids, leads)


def _find_open_slots(user, **kwargs):
    def misses_lead(count, lead_count):
        return (not lead_count) or float(count) / lead_count > 2

    def misses_skypee(count, lead_count):
        return lead_count and float(count) / lead_count < 2

    matches = misses_skypee
    if user.is_skypelead():
        matches = misses_lead
    my_id = user.id

    for date, uids, leads in _filter_for_open_slots(_find_slots(**kwargs)):
        if my_id in uids:
            continue

        if matches(len(uids), len(leads)):
            yield date


def _filter_actually_available(users_per_slot, users_map=None):
    if users_map is None:
        users_map = dict([(x.id, x) for x in User.query.all()])

    actually_available = []

    for key, uids in users_per_slot.iteritems():
        # ensure we skip double bookings
        uids = set(uids)
        if len(uids) < 2:
            continue

        has_lead = False
        users = []
        for uid in uids:
            user = users_map[uid]
            users.append(user)
            if user.is_skypelead():
                has_lead = True

        if not has_lead:
            continue

        actually_available.append((key, users))

    return sorted(actually_available)


def _find_available_slots(users_map=None, **kwargs):
    return _filter_actually_available(_find_slots(**kwargs), users_map=users_map)


def _find_slots(futureWeeks=3, minimum=48, slots_query=None,
                scheduled_query=None, tomorrow=None):

    if tomorrow is None:
        tomorrow = datetime.utcnow() + timedelta(hours=minimum)

    if slots_query is None:
        slots_query = Timeslot.query.filter(or_(Timeslot.once == False,
                and_(Timeslot.once == True, Timeslot.datetime >= tomorrow)))

    if scheduled_query is None:
        scheduled_query = ScheduledCall.query.filter(ScheduledCall.scheduledAt >= tomorrow).join()

    blocked = {}
    for call in scheduled_query:
        for user in call.callers:
            blocked.setdefault(user.id, []).append(_clean_time(call.scheduledAt))

    uids_per_slot = {}

    WEEK = timedelta(days=7)

    for slot in slots_query:
        dt = slot.datetime
        if slot.once:
            if not _clean_time(dt) in blocked.get(slot.user_id, []):
                uids_per_slot.setdefault(_clean_time(dt),
                                          []).append(slot.user_id)
            continue

        while(dt < tomorrow):
            dt += WEEK

        for x in xrange(futureWeeks):
            try:
                if _clean_time(dt) in blocked[slot.user_id]:
                    continue
            except KeyError:
                pass

            uids_per_slot.setdefault(_clean_time(dt),
                                      []).append(slot.user_id)

            dt += WEEK

    return uids_per_slot


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


def with_comment(func):
    @wraps(func)
    def wrapper(id, *args, **kwargs):
        comment = db.session.query(Comment).get(id)
        if not comment:
            abort(404, "Comment Not Found")
        return func(comment, *args, **kwargs)
    return wrapper


def verify_key(func):
    @wraps(func)
    def wrapper(application, key, *args, **kwargs):
        if get_hmac(application.email) != base64.b64decode(key):
            abort(404, "Application not Found")
        return func(application, *args, **kwargs)
    return wrapper


def _render_application(application):
    schema = AnonymousApplicationSchema()
    if current_user.has_role("admin"):
        schema = ApplicationSchema()
    elif current_user.has_role("moderator"):
        schema = ModeratorApplicationSchema()
    return jsonify({"application": schema.dump(application).data})


@app.route('/scheduler/')
def scheduler_index():
    return app.send_static_file('scheduler.html')


@app.route('/')
@login_required
def index():
    return app.send_static_file('index.html')


@app.route('/api/available_slots')
def available_slots():
    slots = _find_available_slots()
    return jsonify({"slots": [x[0] for x in slots]})


@app.route('/api/suggested_slots')
@login_required
@roles_accepted('skypee', 'skypelead')
def suggested_slots():
    return jsonify({"slots": sorted([x for x in _find_open_slots(current_user)][:10])})


@app.route('/api/app_state')
@login_required
def get_state():
    schema = app_state
    query = Application.query.filter(Application.stage in REVIEW_STAGES)

    if current_user.has_role('admin'):
        schema = admin_app_state
        query = Application.query.all()
    elif current_user.has_role('moderator'):
        schema = mod_app_state
        query = Application.query.all()
    else:
        query = filter(lambda app: app.stage in REVIEW_STAGES, current_user.applications)

    return jsonify(schema.dump({"user": current_user._get_current_object(),
                                "applications": query}).data)


@app.route('/api/call_slots', methods=['POST'])
@login_required
@roles_accepted('skypee', 'skypelead')
def add_call_slot():
    timeslot = Timeslot(**request.get_json())
    timeslot.user_id = current_user.id

    db.session.add(timeslot)
    db.session.commit()

    return jsonify(TimeslotSchema().dump(timeslot).data)


@app.route('/api/call_slots/purge', methods=['POST'])
@login_required
@roles_accepted('skypee', 'skypelead')
def pruge_call_slots():
    db.session.query(Timeslot).filter(Timeslot.user_id==current_user.id).delete()
    db.session.commit()

    return jsonify(success=True)


@app.route('/api/me', methods=['PATCH'])
@login_required
def update_me():
    payload = request.get_json()
    user = current_user._get_current_object()
    dirty = False
    for key in ['name', 'timezone']:
        if key in payload:
            setattr(user, key, payload[key])
            dirty = True

    if dirty:
        db.session.add(user)
        db.session.commit()

    return jsonify(me_schema.dump(user).data)


@app.route('/api/call_slots/<int:slotId>', methods=['DELETE'])
@login_required
@roles_accepted('skypee', 'skypelead')
def delete_call_slot(slotId):
    timeslot = db.session.query(Timeslot).get(slotId)
    if timeslot and timeslot.user_id == current_user.id:
        db.session.delete(timeslot)
        db.session.commit()

    return jsonify(success=True)


@app.route('/application/<id>/send_email', methods=['POST'])
@login_required
@roles_accepted('admin', 'moderator')
@with_application
def send_email(application):
    email = (request.form.get("email") or request.args.get("email")) or None
    subject = (request.form.get("subject") or request.args.get("subject")) or None

    if not email:
        abort(400, "Missing email")

    if not subject:
        subject = "Your Hackership Application"

    content = render_template("emails/applicant/general.md",
                              app=application,
                              content=email)

    email = Email(author_id=current_user._get_current_object().id,
                  content=content,
                  incoming=False,
                  stage=application.stage,
                  application_id=application.id,
                  anon_content=email)

    db.session.add(email)
    db.session.add(application)

    # Email 
    application.send_email(subject, content)

    db.session.commit()
    return _render_application(application)


@app.route('/application/<id>/move_to_stage/schedule_skype', methods=['POST'])
@login_required
@roles_accepted('admin', 'moderator')
@with_application_at_stage("review_reply")
def switch_to_schedule_skype(application):
    application.stage = "schedule_skype"
    application.changedStageAt = datetime.now()
    db.session.add(application)
    db.session.commit()

    # Email Reviewers
    application.send_email("Let's schedule a call to talk about your Hackership Application",
                           render_template("emails/applicant/schedule_skype.md",
                                           app=application,
                                           key=base64.b64encode(get_hmac(application.email))))

    return _render_application(application)


@app.route('/application/<id>/move_to_stage/skyped', methods=['POST'])
@login_required
@roles_accepted('admin', 'moderator')
@with_application_at_stage("skype_scheduled")
def switch_to_skyped(application):
    application.stage = "skyped"
    application.changedStageAt = datetime.now()
    db.session.add(application)
    db.session.commit()

    return _render_application(application)


@app.route('/application/<id>/move_to_stage/inactive', methods=['POST'])
@login_required
@roles_accepted('admin', 'moderator')
@with_application
def switch_to_inactive(application):
    application.stage = "inactive"
    application.changedStageAt = datetime.now()
    db.session.add(application)
    db.session.commit()

    return _render_application(application)


@app.route('/application/<id>/move_to_stage/accepted', methods=['POST'])
@login_required
@roles_accepted('admin', 'moderator')
@with_application
def switch_to_accepted(application):
    application.stage = "accepted"
    application.changedStageAt = datetime.now()
    db.session.add(application)
    db.session.commit()

    content = render_template("emails/applicant/accepted.md",
                              app=application)

    email = Email(author_id=current_user._get_current_object().id,
                  content=content,
                  incoming=False,
                  stage=application.stage,
                  application_id=application.id,
                  anon_content=content)

    db.session.add(email)

    application.send_email('You have been accepted', content)

    db.session.commit()
    return _render_application(application)


@app.route('/application/<id>/move_to_stage/grant_review', methods=['POST'])
@login_required
@roles_accepted('admin', 'moderator')
@with_application
def switch_to_grant_review(application):
    application.stage = "grant_review"
    application.changedStageAt = datetime.now()
    db.session.add(application)
    db.session.commit()

    content = render_template("emails/applicant/grant_review.md",
                              app=application)

    email = Email(author_id=current_user._get_current_object().id,
                  content=content,
                  incoming=False,
                  stage=application.stage,
                  application_id=application.id,
                  anon_content=content)

    db.session.add(email)

    application.send_email('You have been accepted', content)

    db.session.commit()

    return _render_application(application)


@app.route('/application/<id>/move_to_stage/grant_accepted', methods=['POST'])
@login_required
@roles_accepted('admin', 'moderator')
@with_application
def switch_to_grant_accepted(application):
    application.stage = "grant_accepted"
    application.changedStageAt = datetime.now()
    db.session.add(application)
    db.session.commit()

    content = render_template("emails/applicant/grant_accepted.md",
                              app=application)

    email = Email(author_id=current_user._get_current_object().id,
                  content=content,
                  incoming=False,
                  stage=application.stage,
                  application_id=application.id,
                  anon_content=content)

    db.session.add(email)

    application.send_email('Your grant has been accepted', content)

    db.session.commit()
    return _render_application(application)


@app.route('/application/<id>/move_to_stage/rejected', methods=['POST'])
@login_required
@roles_accepted('admin', 'moderator')
@with_application
def switch_to_rejected(application):
    application.stage = "rejected"
    application.changedStageAt = datetime.now()
    db.session.add(application)
    db.session.commit()

    return _render_application(application)


@app.route('/application/<id>/move_to_stage/deposit_paid', methods=['POST'])
@login_required
@roles_accepted('admin', 'moderator')
@with_application
def switch_to_deposit_paid(application):
    application.stage = "deposit_paid"
    application.changedStageAt = datetime.now()
    db.session.add(application)
    db.session.commit()

    return _render_application(application)



@app.route('/application/<id>/move_to_stage/review_reply', methods=['POST'])
@login_required
@roles_accepted('admin', 'moderator')
@with_application_at_stage("reply_received")
def switch_to_review_reply(application):

    application.stage = "review_reply"
    application.changedStageAt = datetime.now()
    db.session.add(application)
    db.session.commit()

    # Email Reviewers
    application.send_email('Applicant replied',
                           render_template("emails/reviewer/applicant_replied.md", app=application),
                           map(lambda x: x.email, application.members))

    return _render_application(application)


@app.route('/application/<id>/anon_emails', methods=['POST'])
@login_required
@roles_accepted('admin', 'moderator')
@with_application
def anonymize_emails(application):
    anon_content = (request.form.get("anon_content") or request.args.get("anon_content")) or None
    if anon_content:
        application.anon_content = anon_content

    db.session.add(application)
    for email in application.emails:
        new_content = (request.form.get("{}".format(email.id)) or request.args.get("{}".format(email.id))) or None
        if not new_content:
            continue
        email.anon_content = new_content
        db.session.add(email)

    db.session.commit()

    return _render_application(application)



@app.route('/application/<id>/external/<key>', methods=['GET'])
@with_application
@verify_key
def external_info(application):
    return jsonify(ExternalApplicationSchema().dump(application).data)


@app.route('/application/<id>/schedule/<key>', methods=['POST'])
@with_application
@verify_key
def schedule(application):
    slot = request.form.get("slot")
    skype = request.form.get("skype")
    slots = dict(_find_available_slots())

    if not slot or not skype:
        abort(400, "Please provide slot and skype contact")
    if slot not in slots:
        abort(401, "Slot already taken. Please pick another")

    users = slots[slot]
    if len(users) > 2:
        admins = []
        normal = []
        for user in users:
            admins.append(user) if user.is_skypelead() else normal.append(user)
        random.shuffle(admins)
        random.shuffle(normal)

        if normal:
            users = [admins[0], normal[0]]
        else:
            users = admins[:2]

    for call in application.calls:
        if not call.failed:
            call.failed = True
            if call.calendar_id:
                remove_call_from_calendar(call.calendar_id)
            db.session.add(call)

    call = ScheduledCall(application_id=application.id,
                         scheduledAt=datetime.strptime(slot + "+UTC", "%Y-%m-%d %H:%M:%S+%Z"),
                         skype_name=skype,
                         callers=users)

    application.members = list(set(application.members + call.callers))

    call.calendar_id = add_call_to_calendar(call, application)
    application.stage = 'skype_scheduled'
    db.session.add(call)
    db.session.add(application)
    db.session.commit()
    return jsonify(success=True)


@app.route('/application/<id>/move_to_stage/in_review', methods=['POST'])
@login_required
@roles_accepted('admin')
@with_application_at_stage("incoming")
def switch_to_review(application):
    anon_content = (request.form.get("anon_content") or request.args.get("anon_content")) or None
    if anon_content:
        application.anon_content = anon_content
    application.anonymizer_id = current_user._get_current_object().id
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


@app.route('/application/<id>/move_to_stage', methods=['POST'])
@login_required
@roles_accepted('admin')
@with_application
def switch_to_stage(application):
    stage = (request.form.get("stage") or request.args.get("stage")) or None
    if not stage:
        abort(400, "Missing stage")

    application.stage = stage
    application.changedStageAt = datetime.now()
    db.session.add(application)
    db.session.commit()

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

    email = Email(author_id=current_user._get_current_object().id,
                  content=content,
                  incoming=False,
                  stage=application.stage,
                  application_id=application.id,
                  anon_content=email)

    application.stage = "email_send"
    application.changedStageAt = datetime.now()

    db.session.add(email)
    db.session.add(application)

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
                      author_id=current_user.id,
                      application_id=application.id,
                      stage=application.stage)

    db.session.add(comment)
    db.session.commit()

    # email to other reviewers or moderator?

    return _render_application(application)

@app.route('/comment/<id>/edit', methods=['POST'])
@login_required
@with_comment
def edit_comment(comment):
    content = request.form.get("comment") or request.args.get("comment")
    if not content:
        abort(400, "Please pass a comment")

    comment.content = content

    db.session.add(comment)
    db.session.commit()

    application = db.session.query(Application).get(comment.application_id)

    return _render_application(application)


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

    while True:
        db.session.add(application)
        try:
            db.session.commit()
        except IntegrityError:
            application.anon_name = generate_fancy_name()
        else:
            break

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
                        application_id=application.id,
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

    comment = Comment(author_id=user.id,
                      application_id=application.id,
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
    for role in req['roles']:
        user_datastore.add_role_to_user(user, role)

    #Email Reviewer
    send_email("Welcome to the Hackership Review Panel",
               render_template("emails/reviewer/added.md",
                               username=user.email,
                               password=password,
                               name=user.name),
               [user.email])

    user_datastore.commit()

    return jsonify(success=True)
