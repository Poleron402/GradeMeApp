<img width="226" height="210" alt="grademeduck" src="https://github.com/user-attachments/assets/298ab40d-6ec5-4523-8bc1-c37a1963e80c" />
<br>

[View on Web](https://grademesite.vercel.app/)
<br>

## Your project grading assistant 💯

Grademe is built to help professors and TAs grade coding projects.<br>
Currently supported languages are:
- Java (gradle, mvn)
- Python (pytest, unittest) 

Support for other built tools and languages is in the works.
Grademe uses Ollama to review student code and provide insight into the quality and best practices. While this might not be the best option, it is cheapest.
> [!CAUTION]  
> Be sure to double-check suspect results and report any bugs through issues!

> [!NOTE]  
> The app is built with electron, so the download size is going to be higher. If you'd like to just run the script that generates html with results, pull the ```script``` branch.
   
> [!NOTE]
> You can run this application by downloading it from releases, or by cloning, and running `make start-dev` in the terminal.

### Steps to use:
* App:
   1. Download submissions from Canvas

      <br></br><img width="320" height="225" alt="Screenshot from 2025-08-01 12-42-56" src="https://github.com/user-attachments/assets/55affa5e-fada-4970-a877-7bb05921f69a" />
   3. Choose that submission folder
   4. Choose the folder that contains your __working__ project (Don't worry, it's copied as a tempfile, your project will not change)
   5. Run
* Script:
   1. Run the file with the same folder paths as arguments. E.g. ```python3 main.py '/home/project/submissions' '/home/project/assignment/'```

![output1](https://github.com/user-attachments/assets/1de23831-1af0-45c0-bf3c-81e1416e287a)
