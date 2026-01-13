import ollama
import sys
from scripts.pull_llama import pullama

submission_folder_path = sys.argv[1]
rubric = sys.argv[2]


with open(submission_folder_path, 'r') as file:
    code = file.read()

system_prompt = '''
You are a helpful expert who is good at finding bugs and mishaps in student code. 
Follow directions strictly, if so specified. If the code has any room for improvement, add the improvement suggestions 
in a form of an unordered list (bullet points). Use the following format for your response.
" -- HOW WELL DOES CODE FOLLOW THE RUBRIC -- \n
* Provide your answer
 -- DOES THE CODE CONTAIN ANY VULGAR OR PASSIVE AGRESSIVE COMMENTS -- 
* Provide specific examples from code; surround the examples with ` ` for single line and ``` ``` for multiple lines.
* If the code is free of vulgarities - skip this whole section
-- WHAT IMPROVEMENTS CAN STUDENT DO --\n
* Provide the  improvements, format the answer like so:
* You can even include typo and grammar suggestions, if there is nothing to improve
* If there is truly nothing to improve or work on, give a congratulatory message and a cute emoji.
 '''

if len(rubric)>0:
    prompt =f'''

    Rubric:
    {rubric}

    Code to review:
    {code}

'''   
else:
    prompt =f'''
    In a few sentences (<=200 words strictly), check if the code is well written. Outline any shortcomings.
    Do not analyze anything else.
    Code:
    {code}
'''   
    
model = pullama()
response =  ollama.chat(
    model=model,
    messages=[{'role': 'system', 'content': system_prompt},{'role': 'user', 'content': prompt}]
)
print(response.message.content)

