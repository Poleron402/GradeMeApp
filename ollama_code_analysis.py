import ollama
import sys

def analyze(submission_file_path):


    with open(submission_file_path, 'r') as file:
        code = file.read()
   
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
    try:
        response = ollama.chat(
            model='codellama:7b',
            messages=[{'role': 'user', 'content': prompt}]
        )

        content = getattr(getattr(response, 'message', None), 'content', None)
        if content is None:
            raise ValueError("No content found in Ollama response.")
        return content
    except Exception as e:
        print(f"Error during Ollama API call: {e}", file=sys.stderr)
        return None

