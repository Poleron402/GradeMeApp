class CalcClass:
    def __init__(self):
        pass
    def add(self, a, b): return a + b
    def subtract(self, a, b): return a - b
    def multiply(self, a, b): return a * b
    def divide(self, a, b):
        if self.b == 0: raise ZeroDivisionError("Cannot divide by zero")
        return self.a / self.b