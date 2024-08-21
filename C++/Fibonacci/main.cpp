//Wolfgang Edholm
//CS2B Assignment #4 - Fibonacci

#include <iostream>
#include <ctime>
#include <cmath>
#include <iomanip>
#include "Fibonacci.h"
using namespace std;

const int SIZE = 8;
int nums[SIZE] = {-2, -1, 5, 10, 20, 30, 40, 45};
//int nums[SIZE] = {10, 5, -1};
int values[SIZE];

//main functions
int findNum(int n);

//main method and logic of app
int main() {
   Fibonacci potato;
   cout << "This is the yield for the Fibonacci calculator and time needed for each:\n";
   cout << left
      << setw(15) << "nth number" << setw(10) << "result"
      << "time to complete(sec)\n";
   
   for (int i = 0; i < SIZE; i++)
   {
      values[i] = findNum(nums[i]);
      
      //clock declaration
      clock_t time_req = clock();
      cout << time_req << endl;
      
      cout << setw(15) << nums[i]
         << setw(10) << findNum(nums[i]);
      
      //find time taken to run function
      time_req = clock() - time_req;
      cout << time_req << endl;
      
      //cout << fixed << (float)time_req/CLOCKS_PER_SEC << endl;
   }

   
   return 0;
}

//recursive function
int findNum(int n)
{
   if (n < 0)
   {
      return 0;
   }
   if (n > 0)
   {
      return findNum(n-1) + findNum(n-2);
   }
   else
   {
      return 1;
   }
}
