from app import app
from app import models

@app.route('/')
@app.route('/index')
def index():
    return "Hello, World!"