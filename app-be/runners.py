import os
import shutil
import glob
import re
import subprocess
import xml.etree.ElementTree as ET
from abc import ABC, abstractmethod

class TestRunner(ABC):
    @abstractmethod
    def run_tests(self):
        '''The method responsible for the main test running funcitonality'''

class JavaTestRunner(TestRunner):
    def __init__(self, build, destination, submission_files_location):
        self.build = build
        self.destination = destination
        self.submission_files_location = submission_files_location

    # checking if the filename is the same as the class name it contains (for java, it has to be)
    def check_for_invalid_class_java(self, file):
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
    
    def getXMLGradle(self, outcome):
        results_path = os.path.join(self.destination, "build", "test-results", "test", "TEST-*.xml")
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

    def run_tests(self):
        outcome_list = []
        for i in os.listdir(self.submission_files_location):
            # start the outcome string that will be printed out and sent to FE
            outcome = '' 

            student = {}
            student["name"] = i
            full_path = os.path.join(self.submission_files_location, i)
            

            student_files = os.listdir(full_path)
            continue_flag = False
            for file in student_files:
                file_path = os.path.join(full_path, file)
                if file != self.check_for_invalid_class_java(file_path):
                    continue_flag = True
                else:
                    
                    current_dir = os.getcwd()
                    student["file_path"] = os.path.join(current_dir, file_path)
                    if os.path.exists(f"{self.destination}/src/main/java/org/example/{file}"): # checking if the required file is in a package
                        temp_path = f"{self.destination}/src/main/java/org/example/{file}"
                    else:
                        temp_path = f"{self.destination}/src/main/java/{file}"
                    shutil.copyfile(file_path, temp_path)
                    if not os.path.exists(temp_path):
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
                if self.build == "gradle":
                    subprocess.run(["./gradlew", "test"], cwd=self.destination, check=True, timeout=10, capture_output=True, text=True)
                elif self.build=="mvn":
                    subprocess.run(["mvn", "test"], cwd=self.destination, check=True, timeout=10, capture_output=True, text=True)
            except subprocess.TimeoutExpired as e:
                outcome += F"⏱️ Build timed out. Check manually."
                student["result"] = outcome
                continue
            except subprocess.CalledProcessError as e:
                outcome += "❌ "
            if self.build == 'gradle':
                outcome = self.getXMLGradle(outcome)
            elif self.build == 'mvn':
                results_path = os.path.join(self.destination, "target", "surefire-reports", "*Test.txt")
                matched_path = glob.glob(results_path)
                
                if len(matched_path)>0:
                    for k in matched_path:
                        with open(k, 'r') as test_file:
                            for line in test_file:
                                if "Tests run:" in line:
                                    result_array = re.split(r": |, ", line)
                                    total = int(result_array[result_array.index("Tests run")+1])
                                    failed = int(result_array[result_array.index("Failures")+1])
                                    if total-failed == 10:
                                        if "❌" in outcome:
                                            outcome += f"Something went wrong. Check manually"
                                        else:
                                            outcome += f"✅ {total-failed}/{total}"
                                    else:
                                        outcome += f"{total-failed}/{total}"
                

            student["analysis"] = ""
            student["result"] = outcome
            outcome_list.append(student)
        
        return outcome_list