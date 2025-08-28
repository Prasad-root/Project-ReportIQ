from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
from explainer import explain_func
from extract import extractor
import json


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = "uploads"

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def home():
    return render_template("upload.html")

@app.route('/explain', methods=["POST"])
def explain():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    extract = extractor(filepath)
    report_data = explain_func(extract)   
    
    return render_template("result.html", report=report_data, filename=file.filename)
if __name__ == '__main__':
    app.run(debug=True)
