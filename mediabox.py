import random
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

def get_url():
	"returns a adj + noun str"
	noun_file = "nouns.txt"
	NOUNS = open(noun_file).read().splitlines()
	ADJ = open(adj_file).read().splitlines()
	noun = NOUNS[random.randint(-1,len(NOUNS))]
	adj = ADJ[random.randint(-1,len(ADJ))]
	return adj + ' ' + noun

if __name__ == '__main__':
        app.run()
