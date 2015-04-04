from flask import Flask
from flask import render_template
app = Flask(__name__)
app.debug = True


@app.route('/')
def hello_world():
    return render_template('homepage.html')


@app.route('/client/<room_id>')
def client(room_id):
    pass


@app.route('/host/<room_id>')
def host(room_id):
    pass


if __name__ == '__main__':
        app.run()
