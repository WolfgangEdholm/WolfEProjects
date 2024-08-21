#include "Fibonacci.h"

Fibonacci::Fibonacci()
{
   
}

//getter for inputs
int* Fibonacci::getInputs()
{
   return inputs;
}

//setter for inputs
bool Fibonacci::setInputs(int *values)
{
   *inputs = *values;
   return true;
}

//getter for nthValues
int* Fibonacci::getNthValues()
{
   return nthValues;
}

//setter for nthValues
bool Fibonacci::setNthValues(int *values)
{
   *nthValues = *values;
   return true;
}

int Fibonacci::findNum(int n)
{
   if (n < 0)
   {
      cout << "(" << n << ")->0\n";
      return 0;
   }
   if (n > 0)
   {
      cout << "(" << n << ")->" << findNum(n-1) + findNum(n-2) << "\n";
      return findNum(n-1) + findNum(n-2);
   }
   else
   {
      cout << "(" << n << ")->1\n";
      return 1;
   }
}
