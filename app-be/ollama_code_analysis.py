import ollama
import sys


submission_folder_path = sys.argv[1]
rubric = sys.argv[2]


with open(submission_folder_path, 'r') as file:
    code = file.read()
if len(rubric)>0:
    prompt =f'''
        You are a strict code reviewer who always follows best coding practices.
        Your task is TWO-FOLD:
        1. If the rubric contains explicit questions, answer them directly and clearly.
        2. If the rubric contains any specific rubric or grading criteria, then, check whether the code meets the rubric criteria and provide feedback.
        Do not skip step 1. Do not invent questions that aren't there.
        Keep your response under 150 words.
        Do not mention that you are a strict code reviewer.
    Rubric:
    {rubric}

    Code to review:
    {code}

'''   
else:
    prompt =f'''
    You are a code reviewer that strictly follows the best coding practices.
    In a few sentences (<=200 words strictly), check if the code is well written. Outline any shortcomings.
    Do not analyze anything else.
    Code:
    {code}
'''   
response =  ollama.chat(
    model='llama3',
    messages=[{'role': 'user', 'content': prompt}]
)
print(response.message.content)

