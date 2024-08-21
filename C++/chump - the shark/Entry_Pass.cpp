//  Entry_Pass.cpp
//  chump - the shark
//
//  Created by Wolfgang Edholm on 5/20/21.
//

#include <algorithm>
#include <iostream>
#include <vector>

using std::vector;
using std::cout;
using std::endl;

void insertionSort(vector<int> &elems);

void insertionSort(vector<int> &elems) {
  size_t i, j;
  int key;
  
  for (i = 1; i < elems.size(); i++)
  {
      key = elems[i];
      j = i - 1;

      //Move elements of elems[0..i-1], that are
      //greater than key, to one position ahead
      //of their current position
      while (j >= 0 && elems[j] > key)
      {
          elems[j + 1] = elems[j];
          j = j - 1;
      }
      elems[j + 1] = key;
  }
}

void my_questing_sort_in_place(vector<int> &elems);

void my_questing_sort_in_place(vector<int> &elems) {
  std::sort(elems.begin(), elems.end());
}
