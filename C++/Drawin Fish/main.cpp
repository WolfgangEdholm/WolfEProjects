//
//  main.cpp
//  Drawin Fish
//
//  Created by Wolfgang Edholm on 4/14/21.
//

#include "Set.h"

int main() {
  vector<int> master;
  //size_t master_total = 0;
  master.push_back(1);
  master.push_back(2);
  master.push_back(3);
  
  /*for (size_t i = 0; i < 2; i++) {
    int val = rand() % 300;
    master_total += val;
    master.push_back(val);
  }*/
  
  size_t target = 8;
  
  Set<int> master_set(&master);
  Set<int> best_subset = master_set.find_biggest_subset_le(target);
  
  cout << "Target = " << target << endl;
  cout << "Best sum = " << best_subset.get_sum() << endl;
  cout << best_subset << endl;
}
