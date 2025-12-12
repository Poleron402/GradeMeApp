from unittest import TestCase
import importlib
import calculator

# Test against all calculator versions
class TestingClassCalc(TestCase):
    def test_add(TestCase):
        calc = calculator.CalcClass()
        assert calc.add(2, 3) == 5

    def test_subtract(TestCase):
        calc = calculator.CalcClass()
        assert calc.subtract(10, 3) == 7

    def test_multiply(TestCase):
        calc = calculator.CalcClass()
        assert calc.multiply(4, 2) == 8

    def test_divide(TestCase):
        calc = calculator.CalcClass()
        assert calc.divide(10, 2) == 5

    def test_divide_by_zero(TestCase):
        calc = calculator.CalcClass()
        try:
            calc.divide(5, 0)
        except ZeroDivisionError:
            assert True
        else:
            assert False, f"failed to raise ZeroDivisionError"

    def test_negative_numbers(TestCase):
        calc = calculator.CalcClass()
        assert calc.add(-5, -3) == -8

    def test_floats(TestCase):
        calc = calculator.CalcClass()
        assert round(calc.divide(5.0, 2.0), 2) == 2.5

    def test_large_numbers(TestCase):
        calc = calculator.CalcClass()
        assert calc.multiply(10000, 10000) == 100000000

    def test_mixed_signs(TestCase):
        calc = calculator.CalcClass()
        assert calc.subtract(-5, 10) == -15

    def test_identity(TestCase):
        calc = calculator.CalcClass()
        assert calc.add(0, 0) == 0
