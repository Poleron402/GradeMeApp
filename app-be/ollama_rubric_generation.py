import ollama
import sys
from scripts.pull_llama import pullama

points = sys.argv[1]
about = sys.argv[2]
important = sys.argv[3]
unimportant = sys.argv[4]

system_prompt = '''
You are a detail-oriented and fair grader for coding assignments. 
Format your output in a tabular manner, using html table tags for easy embedding. 
Structure the rubric to have Excellent, Good, Fair, and Poor columns. 
Do NOT include number of points in column name, just list "Excellent", "Good", "Fair", and "Poor"; instead, in the rows, structure descriptions like this: 30 points - Meets standard fully; 20 pts - Some inconsistencies, etc.
Add additional quality items between most and least important ones. If the user did not provide enough rubric requirements to add up to requested number of points, 
improvise and add rubric aspects that can improve assignment grading and can be helpful to students. 
Specify aspects that YOU come up with by adding <span style="color:#61dafbaa">Suggested</span> 
in the Requirements column (this is the first column, the one that describes the requirement) after Requirement description..
Do NOT add the <span style="color:#61dafbaa">Suggested</span> to the requirements that are in any way mentioned by user, because you did not suggest them - they did.
'''
prompt = f'''
Generate me a fair and straightforward rubric for an assignment out of {points} points. The assignment is about:
{about}, the most important requirement: {important}, the least important asprequirementect: {unimportant}. 
Make the most important requirement
be worth the most points, least important - least points and have a separate column dedicated to specifying how much points that part of rubric is worth, showing out of {points} points. 
Be especially precise with point calculations.

'''
model = pullama()
response = ollama.chat(
    model=model,
    messages=[{'role': 'system', 'content': system_prompt},{'role': 'user', 'content': prompt}]
)

print(response.message.content)