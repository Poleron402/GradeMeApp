class CalcClass:
    def __init__(self):
        pass
    def add(self, a, b): return a + b
    def subtract(self, a, b): return a - b
    def multiply(self, a, b): return a * b
    def divide(self, a, b):
        if b == 0: raise ZeroDivisionError
        return a / b

class CalcClass:
    def __init__(self):
        pass
    def add(self, a, b): return a + b
    def subtract(self, a, b): return a + b # logic error
    def multiply(self, a, b): return a * b
    def divide(self, a, b):
        if b == 0: raise ZeroDivisionError
        return a / b

# Wrong overall

# def add(a, b):
#     result = a + b
#     return result

# def subtract(a, b):
#     result = a - b
#     return result

# def multiply(a, b):
#     result = a * b
#     return result

# def divide(a, b):
#     if b == 0:
#         raise ZeroDivisionError("Division by zero is not allowed")
#     return a / b