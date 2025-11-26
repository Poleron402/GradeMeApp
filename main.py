import os
import sys
import shutil
import tempfile
import xml.etree.ElementTree as ET
from datetime import datetime 
from grademe import Submissions
from ollama_code_analysis import analyze
from runners import JavaTestRunner, PythonTestRunner

submission_folder_path = sys.argv[1]
folder_path = sys.argv[2]
language = sys.argv[3]
build = sys.argv[4]
is_sorted = sys.argv[5]

def run():
    results = None
    # make the directory to store the project folder
    factories = {
        "java": JavaTestRunner, 
        "python": PythonTestRunner
    }
    results = None
    # make the directory to store the project folder
    with tempfile.TemporaryDirectory(dir='.') as output_dir:
        shutil.copytree(folder_path, output_dir, dirs_exist_ok=True)
        # copy the submissions folder into local environment
        output_sub_dir = os.path.abspath("submissions")
        if os.path.exists(f'{output_sub_dir}'):
            shutil.rmtree(output_sub_dir)
        os.makedirs(output_sub_dir, exist_ok=True)
        shutil.copytree(submission_folder_path, output_sub_dir, dirs_exist_ok=True)

        # run the submissions folder manipulations - takes student submission files, cleans up the name, and separates them by folders named after student
        my_sub = Submissions(output_sub_dir, language)
        if is_sorted.lower() == "false":
            my_sub.separate_by_folders()    
        runner = factories[language](build, output_dir, output_sub_dir)
        results = runner.run_tests()
        
        
    return results


if __name__ == "__main__":
    run()
