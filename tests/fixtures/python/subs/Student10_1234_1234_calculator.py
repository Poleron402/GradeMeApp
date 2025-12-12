# Wrong overall

def add(a, b):
    result = a + b
    return result

def subtract(a, b):
    result = a - b
    return result

def multiply(a, b):
    result = a * b
    return result

def divide(a, b):
    if b == 0:
        raise ZeroDivisionError("Division by zero is not allowed")
    return a / b