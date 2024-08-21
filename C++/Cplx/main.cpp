// Wolfgang Edholm
//Assignment #9: Complex Numbers

#include <iostream>
#include "Complex.h"
using std::cout;
using std::endl;

//main method and logic of app
int main ( )
{
   Complex c1(14, 12);
   Complex c2(8, 4);
   Complex c3(7,4);
   Complex c4(2, 4);
   Complex c5(10, 2);
   Complex c6(4, 7);
   Complex c7(1, 2);
   Complex c8(0,4);
   Complex c9(48, 22);
   Complex c10(6, 4);
   double d1 = 17;
   double d2 = 8;
   double d3 = 0;
   
   cout << c1 << " + " << c2 << " = " << c1 + c2 << endl;
   cout << c3 << " - " << c4 << " = " << c3 - c4 << endl;
   cout << c5 << " * " << c6 << " = " << c5 * c6 << endl;
   cout << c7 << " / " << c8 << " = " << c7 / c8 << endl;
   cout << c9 << " + " << d1 << " = " << c9 + d1 << endl;
   cout << d2 << " / " << c10 << " = " << d2 / c10 << endl;
   
   //exception tests
   cout << "\nDivision Exception Tests\n";
   
   try
   {
      cout << c1 << " / " << c8 << " = " << c1 / c8 << endl;
   }
   catch (Complex::DivByZeroException)
   {
      cout << "Exception: Cannot divide by zero\n";
   }
   
   try
   {
      cout << c1 << " / " << d3 << " = " << c1 / d3 << endl;
   }
   catch (Complex::DivByZeroException)
   {
      cout << "Exception: Cannot divide by zero\n";
   }
   cout << endl;
}
