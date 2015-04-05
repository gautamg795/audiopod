import random
from flask import Flask
from flask import render_template
app = Flask(__name__)
# app.debug = True
# app.config['SERVER_NAME'] = 'audiopod.me'


@app.route('/')
def hello_world():
    return render_template('homepage.html', room_id=get_url())


@app.route('/<room_id>')
def client(room_id):
    return render_template('client.html', room_id=room_id)


@app.route('/<room_id>/host')
def host(room_id):
    return render_template('host.html', room_id=room_id)

def get_url():
    "returns a adj + noun str"
    noun_file = "nouns.txt"
    adj_file = "adjectives.txt"
    NOUNS = open(noun_file).read().splitlines()
    ADJ = open(adj_file).read().splitlines()
    noun = random.choice(NOUNS)
    while (len(noun) > 6):
        noun = random.choice(NOUNS)
    adj = random.choice(ADJ)
    while (len(adj) > 6):
        adj = random.choice(ADJ)
    return adj + "-" + noun

if __name__ == '__main__':
        app.run()
