//------------------- Complex.cpp --------------------
#include "Complex.h"

const double Complex::MIN_NUM = .0000000001;

Complex::Complex(double real, double imag)
{
   setReal(real);
   setImag(imag);
}

//getter for real
double Complex::getReal()
{
   return real;
}

//setter for real
bool Complex::setReal(double num)
{
   real = num;
   return true;
}

//getter for imag
double Complex::getImag()
{
   return imag;
}

//setter for imag
bool Complex::setImag(double num)
{
   imag = num;
   return true;
}

//returns modulus of complex num
double Complex::Modulus() const
{
   return sqrt(real * real + imag * imag);
}

//returns reciprocal of complex num
Complex Complex::reciprocal() const throw (DivByZeroException)
{
   double divisor = Modulus() * Modulus();

   if (divisor < MIN_NUM)
   {
      throw DivByZeroException();
   }
   
   double r = real / (divisor);
   double i = -imag / (divisor);

   return Complex(r, i);
}

//returns string form of complex num
string Complex::toString()
{
   std::stringstream ss;
   ss << this;
   return ss.str();
}

//operator + overload
const Complex operator + (const Complex& complex1,
                             const Complex& complex2)
{
   double real = complex1.real + complex2.real;
   double imag = complex1.imag + complex2.imag;
   return Complex(real, imag);
}

//operator - overload
const Complex operator - (const Complex& complex1,
                             const Complex& complex2)
{
   double real = complex1.real - complex2.real;
   double imag = complex1.imag - complex2.imag;
   return Complex(real, imag);
}

//operator * overload
const Complex operator * (const Complex& complex1,
                             const Complex& complex2)
{
   double real = complex1.real * complex2.real - complex1.imag * complex2.imag;
   double imag = complex1.real * complex2.imag + complex1.imag * complex2.real;
   return Complex(real, imag);
}

//operator / overload
const Complex operator / (const Complex& complex1,
                             const Complex& complex2)
{
   return complex1 * complex2.reciprocal();
}

//operator << overload
ostream & operator << (ostream &out, const Complex &c)
{
   out << "(" << c.real << ", " << c.imag << ")";
   return out;
}

//assignment operator overload
Complex& Complex::operator = (const Complex& rtSide)
{
   real = rtSide.real;
   imag = rtSide.imag;
   
   //return object for chaining
   return *this;
}

