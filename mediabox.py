from flask import Flask
from flask import render_template
app = Flask(__name__)
app.debug = True


@app.route('/')
def hello_world():
    return render_template('homepage.html')


@app.route('/client/<room_id>')
def client(room_id):
    return render_template('client.html', room_id=room_id)


@app.route('/host/<room_id>')
def host(room_id):
    return render_template('host.html', room_id=room_id)

if __name__ == '__main__':
        app.run()
