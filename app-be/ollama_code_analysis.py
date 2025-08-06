import ollama
import sys


submission_folder_path = sys.argv[1]
rubric = sys.argv[2]


with open(submission_folder_path, 'r') as file:
    code = file.read()
if len(rubric)>0:
    prompt =f'''
[INST] 
    <<SYS>>
        In a few sentences (<=200 words strictly), check if the code corresponds to this rubric: {rubric}
        You are a code reviewer that strictly follows the best coding practices.
    <</SYS>>
    Code:
    {code}
[/INST]
'''   
else:
    prompt =f'''
[INST] 
    <<SYS>>
        You are a code reviewer that strictly follows the best coding practices.
    <</SYS>>
    In a few sentences (<=200 words strictly), check if the code is well written.
    Do not analyze anything else.
    Code:
    {code}
[/INST]
'''   
response =  ollama.chat(
    model='codellama:7b',
    messages=[{'role': 'user', 'content': prompt}]
)
print(response.message.content)

