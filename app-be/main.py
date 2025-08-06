import os
import sys
import shutil
import tempfile
import glob
import json
import re
import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime 
from grademe import Submissions

submission_folder_path = sys.argv[1]
folder_path = sys.argv[2]

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

def run_files(destination, files):

    outcome_list = []
    for i in os.listdir(files):
        outcome = ''
        student = {}
        full_path = os.path.join(files, i)
        
        student_files = os.listdir(full_path)
        student["name"] = i

        continue_flag = False
        for file in student_files:
            file_path = os.path.join(full_path, file)
            if file != check_for_invalid_class_java(file_path):
                continue_flag = True
            else:
                current_dir = os.getcwd()
                student["file_path"] = os.path.join(current_dir, file_path)
                temp_path = f"{destination}/src/main/java/{file}"
                if os.path.exists(temp_path):
                    shutil.copyfile(file_path, f"{destination}/src/main/java/{file}")
                else:
                    continue_flag = True

        if continue_flag:
            outcome += "❌ Errors occured running stuident's submission. Check manually."
            student["result"] = outcome
            student["analysis"] = ""
            student["result"] = outcome
            outcome_list.append(student)
            continue
        current_dir = os.getcwd()
        try:
            subprocess.run(["./gradlew", "test"], cwd=destination, check=True, timeout=10, capture_output=True, text=True)
            
        except subprocess.TimeoutExpired as e:
            outcome += F"⏱️ Build timed out. Check manually."
            student["result"] = outcome
            continue
        except subprocess.CalledProcessError as e:
            outcome += "❌ "

        # analysis = analyze(f"{destination}/src/main/java/{file}")
        # if result:
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

        student["analysis"] = ""
        student["result"] = outcome
        outcome_list.append(student)
    
    # makehtml(outcome_list, file)
    return outcome_list


def run():
    results = None
    # make the directory to store the project folder
    with tempfile.TemporaryDirectory(dir='.') as output_dir:
        # os.makedirs(output_dir, exist_ok=True)
        destination = os.path.join(output_dir, datetime.now().strftime("%Y-%m-%d-%H-%M-%S"))
        shutil.copytree(folder_path, destination, dirs_exist_ok=True)
        
        # copy the submissions folder into local environment
        output_sub_dir = "submissions"
        if os.path.exists(output_sub_dir):
            shutil.rmtree(output_sub_dir)
        os.makedirs(output_sub_dir, exist_ok=True)
        shutil.copytree(submission_folder_path, output_sub_dir, dirs_exist_ok=True)

        # run the submissions folder manipulations - takes student submission files, cleans up the name, and separates them by folders named after student
        my_sub = Submissions(output_sub_dir)
        my_sub.separate_by_folders()

        results = run_files(destination, output_sub_dir)
        
    return results



data = run()
results = sorted(data, key=lambda d: d["name"])
print(json.dumps({"data": results}))
sys.stdout.flush()
