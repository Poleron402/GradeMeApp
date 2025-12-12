import unittest
from calculator import CalcClass


class TestCalculator(unittest.TestCase):
    """Test suite for Calculator class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.calc = CalcClass()
    
    def test_add_positive_numbers(self):
        """Test addition of positive numbers"""
        self.assertEqual(self.calc.add(2, 3), 5)
        self.assertEqual(self.calc.add(10, 20), 30)
    
    def test_add_negative_numbers(self):
        """Test addition with negative numbers"""
        self.assertEqual(self.calc.add(-5, -3), -8)
        self.assertEqual(self.calc.add(-10, 5), -5)
    
    def test_subtract(self):
        """Test subtraction"""
        self.assertEqual(self.calc.subtract(10, 5), 5)
        self.assertEqual(self.calc.subtract(5, 10), -5)
    
    def test_multiply(self):
        """Test multiplication"""
        self.assertEqual(self.calc.multiply(3, 4), 12)
        self.assertEqual(self.calc.multiply(-2, 5), -10)
        self.assertEqual(self.calc.multiply(0, 100), 0)
    
    def test_divide(self):
        """Test division"""
        self.assertEqual(self.calc.divide(10, 2), 5)
        self.assertEqual(self.calc.divide(15, 3), 5)
        self.assertAlmostEqual(self.calc.divide(10, 3), 3.333, places=3)
    
    def test_divide_by_zero(self):
        """Test that division by zero raises ValueError"""
        with self.assertRaises(ZeroDivisionError):
            self.calc.divide(10, 0)


if __name__ == '__main__':
    unittest.main()