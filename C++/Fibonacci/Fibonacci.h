#ifndef Fibonacci_h
#define Fibonacci_h

#include <iostream>
#include <string>
#include <cstdlib>

using namespace std;

//Fibonacci Class
class Fibonacci
{
public:
   //constructor
   Fibonacci();
   
   //getters and setters
   int* getInputs();
   bool setInputs(int* values);
   int* getNthValues();
   bool setNthValues(int* values);
   
   //member function
   int findNum(int n);
   
private:
   //static consts
   static const int ARRAY_SIZE = 10;
   
   //class data
   int inputNum = 0;
   int inputs[ARRAY_SIZE];
   int nthValues[ARRAY_SIZE];
};

#endif /* Fibonacci_h */
