//
//  main.cpp
//  Tree_Algorithms.h
//
//  Created by Wolfgang Edholm on 4/25/21.
//

#include <iostream>
#include "BST.h"
using std::cout;

class Tx {
private:
  template <typename T> static void _splay(typename BST<T>::Node *&p, const T &x);
  template <typename T> static void _rotate_with_left_child(typename BST<T>::Node *&p);
  template <typename T> static void _rotate_with_right_child(typename BST<T>::Node *&p);

public:
  static void wtest();
  template <typename T> static const T &splay_find(BST<T> &tree, const T &x);
  template <typename T> static bool splay_contains(BST<T> &tree, const T &x);
  template <typename T> static bool splay_insert(BST<T> &tree, const T &x);
  template <typename T> static bool splay_remove(BST<T> &tree, const T &x);

  friend class Tests;
};

void Tx::wtest() {
  BST<int> searchTree;

  searchTree.insert(10);
  searchTree.insert(1);
  searchTree.insert(5);
  searchTree.insert(12);
  searchTree.insert(8);
  searchTree.insert(15);
  searchTree.insert(14);
  searchTree.insert(11);
  searchTree.insert(25);
  searchTree.insert(2);
  searchTree.insert(28);
  searchTree.insert(29);
  cout << searchTree.to_string() << "\n\n";

  _splay(searchTree._root, 5);
  cout << searchTree.to_string() << endl;
}

template <typename T>
void Tx::_splay(typename BST<T>::Node *&p, const T &x) {
  typename BST<T>::Node* rightTree = nullptr;
  typename BST<T>::Node* rightTreeMin = nullptr;
  typename BST<T>::Node* leftTree = nullptr;
  typename BST<T>::Node* leftTreeMax = nullptr;

  if (p == nullptr) {
    return;
  }

  while (p != nullptr) {
    if (x < p->_data) {
      if (p->_left == nullptr) {
        break;
      }
      if (x < p->_left->_data) {
        // zig-zig
        _rotate_with_left_child<T>(p);
        if (p->_left == nullptr) {
          break;
        }
      }
      if (rightTreeMin == nullptr) {
        rightTree = p;
      } else {
        rightTreeMin->_left = p;
      }
      rightTreeMin = p;
      p = p->_left;
      rightTreeMin->_left = nullptr;
    } else if (x > p->_data) {
      if (p->_right == nullptr) {
        break;
      }
      if (x > p->_right->_data) {
        // zig-zig
        _rotate_with_right_child<T>(p);
        if (p->_right == nullptr) {
          break;
        }
      }
      if (leftTreeMax == nullptr) {
        leftTree = p;
      } else {
        leftTreeMax->_right = p;
      }
      leftTreeMax = p;
      p = p->_right;
      leftTreeMax->_right = nullptr;
    } else {
      // found x
      break;
    }
  }
  if (leftTree == nullptr) {
    leftTree = p->_left;
  } else {
    leftTreeMax->_right = p->_left;
  }
  if (rightTree == nullptr) {
    rightTree = p->_right;
  } else {
    rightTreeMin->_left = p->_right;
  }
  p->_left = leftTree;
  p->_right = rightTree;
  cout << "Splay Done\n";
}


template <typename T>
void Tx::_rotate_with_left_child(typename BST<T>::Node *&p) {
  if (p == nullptr || p->_left == nullptr) {
    return;
  }

  typename BST<T>::Node *p1 = p->_left;

  //if (p1->_right != nullptr)
    p->_left = p1->_right;

  //p1->_right = new typename BST<T>::Node(p);
  p1->_right = p;
  p = p1;
}

template <typename T>
void Tx::_rotate_with_right_child(typename BST<T>::Node *&p) {
  if (p == nullptr || p->_right == nullptr) {
    return;
  }

  typename BST<T>::Node *p1 = p->_right;

  //if (p1->_left != nullptr)
    p->_right = p1->_left;

  p1->_left = p;
  p = p1;
}

template <typename T>
const T& Tx::splay_find(BST<T> &tree, const T &x) {
  //empty tree
  if (tree._root == nullptr) {
    throw (typename BST<T>::Not_found_exception());
  }
  
  //otherwise splay tree
  _splay(tree._root, x);
  //not found
  if(tree._root->_data != x) {
    throw (typename BST<T>::Not_found_exception());
  } else {
    return x; //found, return reference to value
  }
}

template <typename T>
bool Tx::splay_contains(BST<T> &tree, const T &x) {
  //empty tree
  if (tree._root == nullptr) {
    return false;
  }
  
  //call find
  _splay(tree._root, x);
  if(tree._root->_data != x || tree._root == nullptr) {
    return false;
  } else {
    return true; //found, return reference to value
  }
}

template <typename T>
bool Tx::splay_insert(BST<T> &tree, const T &x) {
  if (tree._root == nullptr) {
    tree._root = new typename BST<T>::Node(x);
    tree._size += 1;
    return true;
  }
  
  _splay(tree._root, x);
  //If node already exists, return false
  if (tree._root->_data == x) {
    return false;
  }
  
  typename BST<T>::Node* newRoot = new typename BST<T>::Node(x);
  
  if (tree._root->_data < x) {
    //severe link between old root and right child
    newRoot->_right = tree._root->_right;
    tree._root->_right = nullptr;
    newRoot->_left = tree._root;
  }
  else if (tree._root->_data > x){ //tree._root > x
    //severe link bewteen old root and left child
    newRoot->_left = tree._root->_left;
    tree._root->_left = nullptr;
    newRoot->_right = tree._root;
  }
  tree._root = newRoot;
  tree._size += 1;
  return true;
}

template <typename T>
bool Tx::splay_remove(BST<T> &tree, const T &x) {
  if (tree._root == nullptr) {
    return false;
  }
  
  _splay(tree._root, x);
  
  //x not found
  if (tree._root->_data != x) {
    return false;
  }
  
  //x found
  typename BST<T>::Node* left = tree._root->_left;
  typename BST<T>::Node* newRoot = nullptr;
  if (left == nullptr) {
    newRoot = tree._root->_right;
  } else {
    newRoot = left;
    _splay(newRoot, x);
    newRoot->_right = tree._root->_right;
  }
  
  delete tree._root;
  tree._root = newRoot;
  tree._size -= 1;
  return true;
}


int main(int argc, const char * argv[]) {
  // insert code here...
  BST<int> tree;
  //tree.insert(5);
  Tx tex;
  tex.wtest();
}
