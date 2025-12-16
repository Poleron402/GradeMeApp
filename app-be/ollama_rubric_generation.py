import ollama
import sys

points = sys.argv[1]
about = sys.argv[2]
important = sys.argv[3]
unimportant = sys.argv[4]


prompt = f'''
Generate me a fair and straightforward rubric for an assignment out of {points} points. The assignment is about:
{about}, the most important aspect: {important}, the least important aspect: {unimportant}. Format your out
put in a tabular manner, using html table tags for easy embedding. Structure the rubric to have Excellent, Good, Fair, and Poor columns. 
Do not include number of points in column name, just list Excellent, Good, Fair, and Poor; instead, in the rows, structure descriptions like this: 30 points - Meets standard fully; 20 pts - Some inconsistencies, etc.
Add additional quality items between most and least important ones. Make the most important aspect
be worth the most points, least important - least points and have a separate column dedicated to specifying how much points that part of rubric is worth, showing out of {points} points. Be especially precise with point calculations.

'''

response = ollama.chat(
    model='llama3',
    messages=[{'role': 'user', 'content': prompt}]
)

print(response.message.content)