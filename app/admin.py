
from flask.ext.admin import Admin, BaseView, expose
from flask.ext.admin.contrib.sqla import ModelView
from flask.ext.security import current_user
from flask import redirect, url_for, request
from app.models import User
from app import app, db

class BaseAdminView(BaseView):

    def is_accessible(self):
        return current_user.is_authenticated() and current_user.can_admin()

    def _handle_view(self, name, **kwargs):
        if not self.is_accessible():
            return redirect(url_for('login', next=request.url))

class UserView(BaseAdminView, ModelView):
    can_create = False
    column_list = ('name', 'email', 'last_login_at', 'login_count')

    def __init__(self, session, **kwargs):
        # You can pass name and other parameters if you want to
        super(UserView, self).__init__(User, session, **kwargs)

admin = Admin(app, name="User Administration")
admin.add_view(UserView(db.session, endpoint="users"))
