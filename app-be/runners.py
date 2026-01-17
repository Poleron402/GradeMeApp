import os
import shutil
import glob
import re
import sys
import subprocess
import xml.etree.ElementTree as ET
from abc import ABC, abstractmethod

class TestRunner(ABC):
    # initialising all the required folder locations
    def __init__(self, build, destination, submission_files_location):
        self.build = build
        self.destination = destination
        self.submission_files_location = submission_files_location
    @abstractmethod
    def run_tests(self):
        '''The method responsible for the main test running functionality'''

    def move_and_validate_student_files(self, student_name):
        outcome = ""
        student = {}
        student["name"] = student_name
        student["file_path"] = []
        full_path = os.path.join(self.submission_files_location, student_name)
        student_files = os.listdir(full_path)
        continue_flag = False
        for file in student_files:
            temp_path = ""
            if  self.__class__.__name__ == "JavaTestRunner":
                file_path = os.path.join(full_path, file)
                if file != self.check_for_invalid_class_java(file_path):
                    continue_flag = True
                else:
                    current_dir = os.getcwd()
                    student["file_path"].append(os.path.join(current_dir, file_path))
                    if os.path.exists(f"{self.destination}/src/main/java/org/example/{file}"): # checking if the required file is in a package
                        temp_path = f"{self.destination}/src/main/java/org/example/{file}"
                    else:
                        temp_path = f"{self.destination}/src/main/java/{file}"         
            elif self.__class__.__name__== "PythonTestRunner":
                temp_path = f"{self.destination}/{file}"
                file_path = os.path.join(full_path, file)
                current_dir = os.getcwd()
                student["file_path"].append(os.path.join(current_dir, file_path))
                
            if not os.path.exists(temp_path):
                continue_flag = True
                outcome += "❌ Errors occured running stuident's submission. Most likely culprit - filename mismatch."
                student["result"] = outcome
            else:
                shutil.copyfile(file_path, temp_path)
        return continue_flag, student, outcome
    
# Python runner 
class PythonTestRunner(TestRunner):
    def run_tests(self):
        outcome_list = []
        for i in os.listdir(self.submission_files_location):
            c_flag, student, outcome = super().move_and_validate_student_files(i)
            if c_flag: 
                outcome_list.append(student)
                continue
            if self.build == "pytest":
                try: 
                    result = subprocess.run(['pytest', '--tb=short'], cwd=self.destination, timeout=10, text=True, capture_output=True)
                    res = result.stdout.splitlines()[-1].replace('=', '')
                except subprocess.TimeoutExpired as e:
                    outcome += F"⏱️ Build timed out. Check manually."
                    student["result"] = outcome
                    continue
                except subprocess.CalledProcessError as e:
                    student["result"] =  f"❌ {res}"
                
                if 'failed' not in res and 'passed' in res:
                    student["result"] = f"✅ {res}"
                else:
                    student["result"] =  f"❌ {res}"
            else:
                try: 
                    result = subprocess.run(['python3', '-m', 'unittest'], cwd=self.destination, timeout=10, text=True, capture_output=True)
                    
                    run_info = result.stderr.splitlines()[-3:]
                    res = " ".join(run_info)
                    if run_info[-1] == "OK":
                        student["result"] = f"✅ {res}"
                    else:
                        student["result"] =  f"❌ {res}"
                except subprocess.TimeoutExpired as e:
                    outcome += F"⏱️ Build timed out. Check manually."
                    student["result"] = outcome
                    continue
                except subprocess.CalledProcessError as e:
                    student["result"] =  f"❌ {res}"
            outcome_list.append(student)
        return outcome_list

# Java runner

class JavaTestRunner(TestRunner):
    def __init__(self, build, destination, submission_files_location):
       super().__init__(build, destination, submission_files_location)

    ''' checking if the filename is the same as the class name it contains (for java, it has to be)'''
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
    
    ''' Since we are not printing out gradle test output but rather parsing the generated XML (to avoid any syntactical errors while parsing),
        We might need that method here 
    '''
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
            is_windows = sys.platform == "win32"
            # start the outcome string that will be printed out and sent to FE
            c_flag, student, outcome = super().move_and_validate_student_files(i)
            if c_flag:
                outcome_list.append(student) 
                continue

            commands = []
            popen_kwargs = {
                "cwd": self.destination,
                "stdout": subprocess.PIPE,
                "stderr": subprocess.PIPE,
                "text": True,
                "shell": False,
            }
            if is_windows:
                if self.build == "gradle":
                    commands = ["cmd.exe", "/c", "gradlew.bat", "test", "--no-daemon"]
                else:
                    commands = ["mvn.cmd", "test"]

                flag = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", None)
                if flag is not None:
                    popen_kwargs["creationflags"] = flag
            else:
                if self.build == "gradle":
                    commands = ["./gradlew", "test"]
                else:
                    commands = ["mvn", "test"]

                popen_kwargs["start_new_session"] = True
            proc = subprocess.Popen(commands, **popen_kwargs)

            try:
                stdout, stderr = proc.communicate(timeout=10)
            except subprocess.TimeoutExpired:
                if is_windows:
                    subprocess.run(
                        ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                else:
                    proc.kill()
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
                
            student["result"] = outcome
            outcome_list.append(student)
        
        return outcome_list