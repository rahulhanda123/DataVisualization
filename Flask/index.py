from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps
from flask import Response
from flask import send_file

app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'facebookdata'
COLLECTION_NAME = 'projects'
DBS_NAME_1 = 'moviesdata'
COLLECTION_NAME_1 = 'moviesReviews'
COLLECTION_NAME_2 = 'moviesGenres'
COLLECTION_NAME_3 = 'moviesPredicted'
#FIELDS = {'school_state': True, 'resource_type': True, 'poverty_level': True, 'date_posted': True, 'total_donations': True, '_id': False}
#Run this in shell to copy all data to mongo db from the csv file 
#mongoimport -d moviesdata -c moviesReviews --type csv --file EnglishMoviesWithBO.csv --headerline
#mongoimport -d moviesdata -c moviesGenres --type csv --file Movies_Genres.csv --headerline
@app.route("/index")
def index():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/redwine")
def redwine():
    return render_template("RedWine.html")

@app.route("/whitewine")
def whitewine():
    return render_template("WhiteWine.html")        

@app.route("/getData")
def aeswaran():
    return render_template("dataSample.html")

@app.route("/movies")
def moviesPage():
    return render_template("movies.html")    
@app.route("/moviesTest")
def moviesPage2():
    return render_template("MoviesTest.html") 

@app.route("/Cleaned_FB.csv")
def getFBCSV():
    # with open("outputs/Adjacency.csv") as fp:
    #     csv = fp.read()
        
    return send_file('Cleaned_FB.csv',
                     mimetype='text/csv',
                     attachment_filename='Adjacency.csv',
                     as_attachment=True) 

@app.route("/winequalityred.csv")
def getRedWineCSV():
    # with open("outputs/Adjacency.csv") as fp:
    #     csv = fp.read()
        
    return send_file('winequalityred.csv',
                     mimetype='text/csv',
                     attachment_filename='Adjacency.csv',
                     as_attachment=True) 

@app.route("/winequalitywhite.csv")
def getWhiteWineCSV():
    # with open("outputs/Adjacency.csv") as fp:
    #     csv = fp.read()
        
    return send_file('winequalitywhite.csv',
                     mimetype='text/csv',
                     attachment_filename='Adjacency.csv',
                     as_attachment=True) 

@app.route("/get_image")
def get_image():
    filename = 'Categories.png'
    return send_file(filename, mimetype='image/gif')   

@app.route("/facebookdata/projects")
def donorschoose_projects():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    projects = collection.find()
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    #return Response(json.dumps(json_projects), mimetype='application/json')
    return json_projects

@app.route("/moviesdata/movies")
def moviereview_projects():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME_1][COLLECTION_NAME_1]
    projects = collection.find()
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    #return Response(json.dumps(json_projects), mimetype='application/json')
    return json_projects

@app.route("/moviesdata/genres")
def moviereview_genres():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME_1][COLLECTION_NAME_2]
    projects = collection.find()
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    #return Response(json.dumps(json_projects), mimetype='application/json')
    return json_projects          
@app.route("/moviesdata/predicted")
def moviereview_predicted():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME_1][COLLECTION_NAME_3]
    projects = collection.find()
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    #return Response(json.dumps(json_projects), mimetype='application/json')
    return json_projects     
if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)