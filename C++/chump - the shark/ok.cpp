//
//  main.cpp
//  chump - the shark
//
//  Created by Wolfgang Edholm on 5/22/21.
//

#include "Pivoting.h"
#include <algorithm>

using std::vector;
using std::cout;
using std::endl;

/*void my_questing_sort_in_place(vector<int> &elems);

void my_questing_sort_in_place(vector<int> &elems) {
  std::sort(elems.begin(), elems.end());
}*/

int main() {
  Pivoting<int> pivot;
  pivot.test();
}
