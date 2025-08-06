import shutil
import os
import re



class Submissions:
    folder_path = os.getcwd()
    folder_student_names = []


    def __init__(self, folder_name):
        self.folder_path = folder_name

    # cleaning up the Canvas naming convention
    def cleanup(self, f_name):
        pattern1 = r"-\d+"
        pattern2 = r"_\d+_\d+_"

        f_name = re.sub(pattern1, "", f_name)
        f_name = re.sub(pattern2, "_", f_name)
        return f_name
    
    def separate_by_folders(self):
        for filename in os.listdir(self.folder_path):
            my_path = os.path.join(self.folder_path, filename)
            if filename.endswith(".java"):
                new_filename = self.cleanup(filename)
                new_path = os.path.join(self.folder_path, new_filename)
                os.rename(my_path, new_path)
                if "_" in new_filename:
                    folder_name = new_filename.split("_")[0]
                    os.makedirs(f"{self.folder_path}/{folder_name}", exist_ok=True)
                    new_folder_path = os.path.join(self.folder_path, folder_name)
                    shutil.move(os.path.join(self.folder_path, new_filename), os.path.join(new_folder_path, new_filename.split("_")[1]))
            elif os.path.isfile(os.path.join(self.folder_path, filename)) and not filename.endswith(".py") and not filename.endswith(".sh"):
                os.remove(os.path.join(self.folder_path, filename))
