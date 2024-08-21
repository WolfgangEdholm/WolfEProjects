// Wolfgang Edholm
// CS2B Assignment #7 - Selection Sort vs Insertion Sort

#include <iostream>
#include <chrono>
#include <cmath>
#include <iomanip>
using std::cout;

template<class T>
//swaps 2 values
void swapValues(T& variable1, T& variable2)
{
    T temp;
    temp = variable1;
    variable1 = variable2;
    variable2 = temp;
}

template <class T>
//insertion sort helper method
//returns new index of array value in sorted portion of array
int indexOfSortNum(const T a[], int endIndex)
{
   int indexOfSortNum = endIndex;
   
   //Runs until beginning of array reached or larger value is found
   for (int index = endIndex - 1; index >= 0; index--)
   {
      if (a[endIndex] < a[index])
      {
         //set updated index for value
         indexOfSortNum = index;
      }
      else
      {
         return indexOfSortNum;
      }
   }
   //loop does not run, return 0 for error
   return 0;
}

template <class T>
//insertion sort function
void insertionSort(T a[], int numberUsed)
{
   int sortNum = 0;
   
   //Sorts first 2 values, then 3, and so on until end of array is reached
   for (int index = 1; index <= numberUsed - 1; index++)
   {
      sortNum = indexOfSortNum(a, index);
      //Update positions of values in sorted array
      for (int i = index; sortNum < i; i--)
      {
         swapValues(a[i], a[i - 1]);
      }
   }
}

template<class T>
//Finds the smallest value in a part of an array
int indexOfSmallest(const T a[], int startIndex, int numberUsed)
{
    T min = a[startIndex];
    int indexOfMin = startIndex;

    for (int index = startIndex + 1; index < numberUsed; index++)
    {
        if (a[index] < min)
        {
            min = a[index];
            indexOfMin = index;
            // min is the smallest of a[startIndex] through a[index]
        }
    }
    return indexOfMin;
}

template<class T>
//selection sort function
void selectionSort(T a[], int numberUsed)
{
    int indexOfNextSmallest;
    for (int index = 0; index < numberUsed - 1; index++)
    {// Place the correct value in a[index]
        indexOfNextSmallest =
            indexOfSmallest(a, index, numberUsed);
        swapValues(a[index], a[indexOfNextSmallest]);
        // a[0] <= a[1] <=...<= a[index] are the smallest of the original
        // array elements.  The rest of the elements are in the remaining
        // positions.
    }
}

//global constants
const int ELEMENTS_PER_ROW = 10;
const int TIME_PRECISION = 9;
const int DOUBLE_PRECISION = 1;

//main method and logic of function
int main ()
{
   //Int array initialization
   int intSelectionArray[] = { 34, 5, 8, 12, 41, 63, 65, 74, 21, 25, 6, 7, 2,
                              31, 24, 51, 17, 13, 23, 16, 81, 28, 91, 37, 98,
                              25, 74, 61, 95, 20, 51, 40, 87, 80, 99, 66, 44,
                              70, 31, 29 };
   
   int intInsertionArray[] = { 34, 5, 8, 12, 41, 63, 65, 74, 21, 25, 6, 7, 2,
                              31, 24, 51, 17, 13, 23, 16, 81, 28, 91, 37, 98,
                              25, 74, 61, 95, 20, 51, 40, 87, 80, 99, 66, 44,
                              70, 31, 29 };
   
   //Double array initialization
   double doubleSelectionArray[] = {3.4, 0.5, 0.8, 1.2, 4.1, 6.3, 6.5, 7.4,
                                    2.1, 2.5, 0.6, 0.7, 0.2, 3.1, 2.4, 5.1,
                                    1.7, 1.3, 2.3, 1.6, 8.1, 2.8, 9.1, 3.7,
                                    9.8, 2.5, 7.4, 6.1, 9.5, 2.0, 5.1, 4.0,
                                    8.7, 8.0, 9.9, 6.6, 4.4, 7.0, 3.1, 2.9};
   
   double doubleInsertionArray[] = {3.4, 0.5, 0.8, 1.2, 4.1, 6.3, 6.5, 7.4,
                                    2.1, 2.5, 0.6, 0.7, 0.2, 3.1, 2.4, 5.1,
                                    1.7, 1.3, 2.3, 1.6, 8.1, 2.8, 9.1, 3.7,
                                    9.8, 2.5, 7.4, 6.1, 9.5, 2.0, 5.1, 4.0,
                                    8.7, 8.0, 9.9, 6.6, 4.4, 7.0, 3.1, 2.9};
   
   //get size of int array and double array
   int intArraySize = sizeof(intInsertionArray)
                     / sizeof(intInsertionArray[0]);
   
   int doubleArraySize = sizeof(doubleInsertionArray)
                        / sizeof(doubleInsertionArray[0]);
   
   //int array display
   cout << "Unsorted int array\n";
   for (int i = 0; i < intArraySize; i++)
   {
      cout << intInsertionArray[i] << " ";
      if ((i + 1) % ELEMENTS_PER_ROW == 0)
      {
         cout << "\n";
      }
   }
   cout << "\n\n";
   
   //double array display
   cout << "Unsorted double array\n";
   for (int i = 0; i < doubleArraySize; i++)
   {
      cout << std::fixed << std::setprecision(DOUBLE_PRECISION)
            << doubleInsertionArray[i] << " ";
      if ((i + 1) % ELEMENTS_PER_ROW == 0)
      {
         cout << "\n";
      }
   }
   cout << "\n\n";
   
   //Selection Sort and Insertion Sort tests
   //Time taken to sort found using std::chrono:steady_clock
   
   //int array selectionSort
   auto start = std::chrono::steady_clock::now();
   selectionSort(intSelectionArray, intArraySize);
   
   auto end = std::chrono::steady_clock::now();
   std::chrono::duration<double> elapsed_seconds = end - start;
   
   cout << "Int array sorted with selection sort\n";
   for (int i = 0; i < intArraySize; i++)
   {
      cout << intSelectionArray[i] << " ";
      if ((i + 1) % ELEMENTS_PER_ROW == 0)
      {
         cout << "\n";
      }
   }
   cout << "\n";
   
   cout << "Time taken: "
      << std::fixed << std::setprecision(TIME_PRECISION)
      << elapsed_seconds.count() << " seconds\n\n";
   
   //int array insertionSort
   start = std::chrono::steady_clock::now();
   insertionSort(intInsertionArray, intArraySize);
   end = std::chrono::steady_clock::now();
   elapsed_seconds = end - start;
   
   cout << "Int array sorted with insertion sort\n";
   for (int i = 0; i < intArraySize; i++)
   {
      cout << intInsertionArray[i] << " ";
      if ((i + 1) % ELEMENTS_PER_ROW == 0)
      {
         cout << "\n";
      }
   }
   cout << "\n";
   
   cout << "Time taken: "
      << std::fixed << std::setprecision(TIME_PRECISION)
      << elapsed_seconds.count() << " seconds\n\n";
   
   //double array selectionSort
   start = std::chrono::steady_clock::now();
   selectionSort(doubleSelectionArray, doubleArraySize);
   end = std::chrono::steady_clock::now();
   elapsed_seconds = end-start;
   
   cout << "Double array sorted with selection sort\n";
   for (int i = 0; i < doubleArraySize; i++)
   {
      cout << std::setprecision(DOUBLE_PRECISION)
            << doubleSelectionArray[i] << " ";
      if ((i + 1) % ELEMENTS_PER_ROW == 0)
      {
         cout << "\n";
      }
   }
   cout << "\n";
   
   cout << "Time taken: "
      << std::fixed << std::setprecision(TIME_PRECISION)
      << elapsed_seconds.count() << " seconds\n\n";
   
   //double array insertionSort
   start = std::chrono::steady_clock::now();
   insertionSort(doubleInsertionArray, doubleArraySize);
   end = std::chrono::steady_clock::now();
   elapsed_seconds = end-start;
   
   cout << "Double array sorted with insertion sort\n";
   for (int i = 0; i < doubleArraySize; i++)
   {
      cout << std::setprecision(DOUBLE_PRECISION)
            << doubleInsertionArray[i] << " ";
      if ((i + 1) % ELEMENTS_PER_ROW == 0)
      {
         cout << "\n";
      }
   }
   cout << "\n";
   
   cout << "Time taken: "
      << std::fixed << std::setprecision(TIME_PRECISION)
      << elapsed_seconds.count() << " seconds\n";
}

/* ---------------------- Sample Run ---------------------------
Unsorted int array
34 5 8 12 41 63 65 74 21 25
6 7 2 31 24 51 17 13 23 16
81 28 91 37 98 25 74 61 95 20
51 40 87 80 99 66 44 70 31 29


Unsorted double array
3.4 0.5 0.8 1.2 4.1 6.3 6.5 7.4 2.1 2.5
0.6 0.7 0.2 3.1 2.4 5.1 1.7 1.3 2.3 1.6
8.1 2.8 9.1 3.7 9.8 2.5 7.4 6.1 9.5 2.0
5.1 4.0 8.7 8.0 9.9 6.6 4.4 7.0 3.1 2.9


Int array sorted with selection sort
2 5 6 7 8 12 13 16 17 20
21 23 24 25 25 28 29 31 31 34
37 40 41 44 51 51 61 63 65 66
70 74 74 80 81 87 91 95 98 99

Time taken: 0.000002712 seconds

Int array sorted with insertion sort
2 5 6 7 8 12 13 16 17 20
21 23 24 25 25 28 29 31 31 34
37 40 41 44 51 51 61 63 65 66
70 74 74 80 81 87 91 95 98 99

Time taken: 0.000002416 seconds

Double array sorted with selection sort
0.2 0.5 0.6 0.7 0.8 1.2 1.3 1.6 1.7 2.0
2.1 2.3 2.4 2.5 2.5 2.8 2.9 3.1 3.1 3.4
3.7 4.0 4.1 4.4 5.1 5.1 6.1 6.3 6.5 6.6
7.0 7.4 7.4 8.0 8.1 8.7 9.1 9.5 9.8 9.9

Time taken: 0.000002870 seconds

Double array sorted with insertion sort
0.2 0.5 0.6 0.7 0.8 1.2 1.3 1.6 1.7 2.0
2.1 2.3 2.4 2.5 2.5 2.8 2.9 3.1 3.1 3.4
3.7 4.0 4.1 4.4 5.1 5.1 6.1 6.3 6.5 6.6
7.0 7.4 7.4 8.0 8.1 8.7 9.1 9.5 9.8 9.9

Time taken: 0.000002438 seconds
Program ended with exit code: 0
----------------------------------------------------------- */
