##Welcome!
ReviewApp is a web app aimed to remove unwelcome biases from the Hackership application review process - written in **React.js and Flask**. It allows an admin to anonymize student applications, after which reviewers can read, make comments, send e-mails and change the status of the application. In addition, it helps reviewers make skype appointments with applicants (during the non-anonymous phase of the review process).

Please have a look at our [wiki](https://github.com/Hackership/reviewapp-backend/wiki/Introduction) for a quick overview of the app! Or, if you would like to run the app yourself, or contribute, follow the instructions below. Happy hacking!

##Get started

###Run npm install:
From your project file:
```
npm install
```


###Virtual environment:
```
virtualenv .
source flask/bin/activate
```

```
pip install -r requirements.txt
```
###Local configuration:
A local configuration file should contain the URI to your local postgres database. In addition, if you want to be able to send email, also add name and password of you email server.

Or just copy paste the code below and replace the placeholders with actual information.

```
MAIL_SERVER = 'smtp.mandrillapp.com'
MAIL_PORT = 123
MAIL_USERNAME = 'your_email@email.com'
MAIL_PASSWORD = 'your_password'

SQLALCHEMY_DATABASE_URI = "postgres://@localhost/db_name"

```

###Start server:
from your virtual environment run:
```
python manager.py runserver
```

###Populate the Database:
from your virtual environment:
```
python faker/test_post.py
```
There are other test scripts in the faker file, give them a try!

###Run JS App:
```
webpack --watch --colors
```

Et voila, head over to localhost:5000 to see the app in action.

Login with one of the test accounts:
admin@example.org, or reviewer@example.org, password: password
The test posts you created before are not yet anonymized and live in the incoming folder that can only be viewed by admins (so use that account first!).


