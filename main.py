import os
import sys
import shutil
import tempfile
import glob
import time
import re
import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime 
from grademe import Submissions
from ollama_code_analysis import analyze

submission_folder_path = sys.argv[1]
folder_path = sys.argv[2]
language = sys.argv[3]
build = sys.argv[4]
is_sorted = sys.argv[5]

def check_for_invalid_class_java(file):
    with open(file, 'r') as f:
        content = f.readlines()

    for i in content:
        match = re.search(r"^([a-z]+\s+)+class\s+[A-Za-z_][A-Za-z0-9_]*", i)
        if match:
            break
    if match:
        return match.group().split(" ")[-1]+".java"
    else:
        return ""
    

def makehtml(results, file_name):
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Class gradesm for {file_name}</title>
    <link rel="stylesheet" href="styles/styles.css">
</head>
<body>
    <h1>Class grades</h1>
"""
    with open("report.html", "w") as f:
        f.write(html_content)
        f.write(results)
        f.write("""
</body>
</html>
                """)

def getXMLGradle(destination, outcome):
    results_path = os.path.join(destination, "build", "test-results", "test", "TEST-*.xml")
    result_files = glob.glob(results_path) # makes the TEST-*.xml work
    if result_files:
        xml_tree = ET.parse(result_files[0])
        root = xml_tree.getroot()
        all_tests = int(root.attrib.get('tests'))
        failed = int(root.attrib.get('skipped'))+int(root.attrib.get('failures'))+int(root.attrib.get('errors'))
        passed = all_tests-failed
        if "❌" in outcome:
            if passed == all_tests:
                outcome += "Something went wrong; Check manually"
            else:
                outcome += f"{passed}/{all_tests}"
        else:
            outcome += f"✅ {passed}/{all_tests}"
    return outcome

def run_files(destination, files):
    outcome_html = ''
    for i in os.listdir(files):
        outcome = ''
        full_path = os.path.join(files, i)
        
        student_files = os.listdir(full_path)
        outcome += f"<br></br>Name: {i}"
        continue_flag = False
        for file in student_files:
            file_path = os.path.join(full_path, file)

            if file != check_for_invalid_class_java(file_path):
                continue_flag = True
            else:
                temp_path = f"{destination}/src/main/java/{file}"
                print(f"temp_path: {temp_path}")

                shutil.copyfile(file_path, f"{destination}/src/main/java/{file}")
                if not os.path.exists(temp_path):
                    continue_flag = True
        if continue_flag:
            outcome += "❌ Errors occured running stuident's submission. Check manually."
            outcome += f"<br></br>Result: {outcome}"
            continue

        try:
            if build == "gradle":
                subprocess.run(["./gradlew", "test"], cwd=destination, check=True, timeout=10, capture_output=True, text=True)
            elif build=="mvn":
                subprocess.run(["mvn", "test"], cwd=destination, check=True, timeout=10, capture_output=True, text=True)
        except subprocess.TimeoutExpired as e:
            outcome += F"⏱️ Build timed out. Check manually."
            continue
        except subprocess.CalledProcessError as e:
            outcome += "❌ "
        
        outcome+="<br></br>"
        # analysis = analyze(f"{destination}/src/main/java/{file}")
        outcome+="<br></br>"

        if build == 'gradle':
            outcome = getXMLGradle(destination, outcome)
        elif build == 'mvn':
            print("Hi!")
            results_path = os.path.join(destination, "target", "surefire-reports", "*Test.txt")
            matched_path = glob.glob(results_path)
            
            if len(matched_path)>0:
                for i in matched_path:
                    with open(i, 'r') as test_file:
                        for line in test_file:
                            if "Tests run:" in line:
                                outcome += line
        
        # outcome += f"<br></br>Analysis: {analysis}"
        outcome_html+=outcome
    makehtml(outcome_html, file)


def run():
    results = None
    # make the directory to store the project folder
    with tempfile.TemporaryDirectory(dir='.') as output_dir:
        # os.makedirs(output_dir, exist_ok=True)
        shutil.copytree(folder_path, output_dir, dirs_exist_ok=True)
        
        # copy the submissions folder into local environment
        output_sub_dir = "submissions"
        if os.path.exists(f'{output_dir}/{output_sub_dir}'):
            shutil.rmtree(output_sub_dir)
        os.makedirs(output_sub_dir, exist_ok=True)
        shutil.copytree(submission_folder_path, output_sub_dir, dirs_exist_ok=True)

        # run the submissions folder manipulations - takes student submission files, cleans up the name, and separates them by folders named after student
        my_sub = Submissions(output_sub_dir)
        my_sub.separate_by_folders()

        results = run_files(output_dir, output_sub_dir)
        
    return results


if __name__ == "__main__":
    run()
