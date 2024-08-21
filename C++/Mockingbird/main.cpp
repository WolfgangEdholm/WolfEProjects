//
//  main.cpp
//  Mockingbird
//
//  Created by Wolfgang Edholm on 4/21/21.
//

#include <iostream>
#include <sstream>
#include "BST.h"
#include "Lazy_BST.h"

int main(int argc, const char * argv[]) {
//  BST<int>  bst;
//  bst.insert(19);
//  bst.insert(9);
//  bst.insert(29);
//  bst.insert(4);
//  bst.insert(14);
//  bst.insert(-1);
//  bst.insert(24);
//  bst.insert(34);
//  bst.insert(39);
//
//  cout << bst.to_string() << endl;
//  cout << "\n";

  BST<int> searchTree;

  searchTree.insert(50);
  searchTree.insert(20);
  searchTree.insert(30);
  searchTree.insert(70);
  searchTree.insert(10);
  searchTree.insert(11);
  searchTree.insert(20); // dup
  searchTree.insert(30); // dup
  searchTree.insert(60);

  cout << searchTree.to_string() << endl;
  
  //searchTree.clear();
  //cout << searchTree.to_string() << endl;
  
  
  cout << "size: " << searchTree.get_size() << endl;
  //cout << "real size: " << searchTree.get_real_size() << endl;
  return 0;
}
