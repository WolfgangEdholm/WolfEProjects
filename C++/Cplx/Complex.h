//
//  Complex.h
//  Cplx
//
//  Created by Wolfgang Edholm on 3/7/21.
//

#ifndef Complex_h
#define Complex_h

#include <iostream>
#include <sstream>
#include <string>

using std::cout;
using std::string;
using std::ostream;



class Complex
{
public:
   //error class
   class DivByZeroException
   {
   };
   
   //constructor
   Complex(double real = 0, double imag = 0);
   
   //Assignment operator
   Complex& operator = (const Complex& rtSide);
   
   //getters and setters
   double getReal();
   double getImag();
   bool setReal(double num);
   bool setImag(double num);
   
   //helper shitters
   double Modulus() const;
   Complex reciprocal() const throw (DivByZeroException);
   string toString();

   //operator overloads
   friend const Complex operator + (const Complex& complex1,
                                    const Complex& complex2);
   friend const Complex operator - (const Complex& complex1,
                                    const Complex& complex2);
   friend const Complex operator * (const Complex& complex1,
                                    const Complex& complex2);
   friend const Complex operator / (const Complex& complex1,
                                    const Complex& complex2);
   friend ostream& operator << (ostream& out, const Complex& c);
   
private:
   //class data
   double real;
   double imag;
   
   static const double MIN_NUM;
};

#endif /* Complex_h */
