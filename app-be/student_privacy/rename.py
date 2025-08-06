
"""
This file is used for renaming files in canvas submission just in-case.
Note: the code does not rename file names if they include student's name,
nor does it remove the comment headers yet. 
"""

# LLM-generated international placeholder names
replacers = [
    "JohnDoe",
    "JaneDoe",
    "JoeBloggs",
    "JanetBloggs",
    "MaxMustermann",
    "ErikaMustermann",
    "JeanDupont",
    "JeanneDupont",
    "JuanPerez",
    "JuanaPerez",
    "MarioRossi",
    "MariaRossi",
    "IvanIvanov",
    "AnnaIvanova",
    "MohammedAli",
    "FatimaZahra",
    "NguyenVanA",
    "NguyenThiB",
    "TaroYamada",
    "HanakoYamada",
    "KimMinsu",
    "ParkJiwoo",
    "SiphoDlamini",
    "ThandiDlamini",
    "ChineduOkeke",
    "NgoziOkeke",
    "AaravSharma",
    "PriyaSharma",
    "AliReza",
    "SaraReza",
    "JamalUddin",
    "NusratJahan",
    "AhmadKhan",
    "AyeshaKhan",
    "JohnSmith",
    "MarySmith",
    "OleHansen",
    "IngridHansen",
    "CarlosSilva",
    "AnaSilva",
    "PetarPetrovic",
    "MarijaPetrovic",
    "JohanvanderMerwe",
    "ElenaPopova",
    "LuciaGomez",
    "MeiLin",
    "WeiZhang",
    "TomasNovak",
    "ZuzanaNovakova",
]

import re
import sys
import os
import random

path = sys.argv[1]

picked = {}
used = []

# first for-loop to map names to fake names
for i in os.listdir(path):
    name = re.search(r"^[a-zA-Z-]+_", i).group()
    # associate student's name with random name if there are multiple file submissions
    if name not in picked.keys():
        choice = random.choice(replacers)
        while choice in used:
            choice = random.choice(replacers)
        picked[name] = choice
        used.append(choice)


#second for-loop to replace names
for i in os.listdir(path):  
    x = re.search(r"_\d+_\d+.+\.([a-zA-Z]+)", i).group()
    name = re.search(r"^[a-zA-Z]+_", i).group()
    old_name = os.path.join(path, i)
    new_name = os.path.join(path, f"{picked.get(name)}{x}")
    os.rename(old_name, new_name)

    if new_name.endswith(".java"):

        with open(new_name, "r") as file:
            code = file.read()
        code = re.sub(r'\/\*+(.*?|\n|\r)+\*\/', '', code)

        with open(new_name, "w") as file:
            file.write(code)
