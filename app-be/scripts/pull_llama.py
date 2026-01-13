import ollama

def pullama():
    model = "llama3"
    should_pull = True
    for mod in ollama.list()["models"]:
        if model in mod:
            should_pull = False
            model = mod
            break
    if should_pull:
        ollama.pull(model)
    return model