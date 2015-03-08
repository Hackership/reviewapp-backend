from app import app
from app import models


def send_email(email, msg):
    return


def select_reviewers():
    #select two reviewers
    return ['reviewerOne', 'reviewerTwo']

def parse_application(application):
    return application

@app.route('/')
@app.route('/ping')
def index():
    return "pong"


@app.route('/applications/all', methods=['GET'])
def get_applications(request):
    return 'applications'


@app.route('/application/update', methods=['POST'])
def update_application(request):
    return


@app.route('/application/email', methods=['POST'])
def email_applicant(request):
    return


@app.route('/applications/new', methods=['POST'])
def new_application(request):
    #Send e-mail to applicant
    #Select Reviewers: get all reviewers for reviewer = active,
    #sort by number of applications
    #Email Reviewers
    return 'applications'


@app.route('/reviewer/new', methods=['POST'])
def add_reviewer(request):
    user = models.User(name=request.form['name'],
                       email=request.form['email'],
                       role=request.form['role'])
    user.save()

    #only if user.role is admin
    #send e-mail to new reviewer with username and password
    return 'password'


@app.route('/reviewer/login', methods=['POST'])
def login(request):
    return


@app.route('/reviewer/logout', methods=['GET'])
def logout(request):
    return

