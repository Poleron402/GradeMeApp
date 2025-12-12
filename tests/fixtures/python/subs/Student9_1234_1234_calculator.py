class CalcClass:
    def __init__(self):
        pass
    def add(self, a, b): return a + b
    def subtract(self, a, b) return a - b
    def multiply(self, a, b): return a * b
    def divide(self, a, b):
        if b == 0: raise ZeroDivisionError
        return a / b