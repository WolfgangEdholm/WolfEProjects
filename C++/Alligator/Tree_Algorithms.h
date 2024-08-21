//
//  Tree_Algorithms.h
//  Alligator
//

#ifndef Tree_Algorithms_h
#define Tree_Algorithms_h

#include "BST.h"

class Tx {
private:
  template <typename T> static void _splay(typename BST<T>::Node*& p,  const T& x);
  template <typename T> static void _rotate_with_left_child(typename BST<T>::Node*& p);
  template <typename T> static void _rotate_with_right_child(typename BST<T>::Node*& p);

public:
  template <typename T> static const T& splay_find(BST<T>& tree, const T& x);
  template <typename T> static bool splay_contains(BST<T>& tree, const T& x);
  template <typename T> static bool splay_insert(BST<T>& tree, const T& x);
  template <typename T> static bool splay_remove(BST<T>& tree, const T& x);

  static void test();

  friend class Tests; // Don't remove
};

template <typename T>
void Tx::_splay(typename BST<T>::Node*& p, const T& x) {
  int i = 0;
  //while (p != nullptr) {
  if (p != nullptr) {
    i += 1;
    //if (i > 5) break;
    if (p == nullptr || p->_data == x) {
      cout << "Done\n";
      return;
    }
    if (p->_left != nullptr && p->_left->_data == x) {
      _rotate_with_left_child<T>(p);
    } else if (p->_right != nullptr && p->_right->_data == x) {
      Tx::_rotate_with_right_child<T>(p);
    } else if (x < p->_data && p->_left != nullptr && x < p->_left->_data) {
      cout << "A\n";
      _rotate_with_left_child<T>(p->_left);
      _rotate_with_left_child<T>(p);
    } else if (x < p->_data && p->_left != nullptr && x > p->_left->_data) {
      cout << "B\n";
      _rotate_with_right_child<T>(p->_left);
      _rotate_with_left_child<T>(p);
    } else if (x > p->_data && p->_right != nullptr && x < p->_right->_data) {
      cout << "C\n";
      _rotate_with_left_child<T>(p->_right);
      _rotate_with_right_child<T>(p);
    } else if (x > p->_data && p->_left != nullptr && x > p->_right->_data) {
      cout << "D\n";
      _rotate_with_right_child<T>(p->_right);
      _rotate_with_right_child<T>(p);
    }
  }
}

template <typename T>
void Tx::_rotate_with_left_child(typename BST<T>::Node*& p) {
  if (p == nullptr || p->_left == nullptr) {
    return;
  }
  typename BST<T>::Node* l = p->_left;
  p->_left = l->_right;
  l->_right = p;
  p = l;
}

template <typename T>
void Tx::_rotate_with_right_child(typename BST<T>::Node*& p) {
  if (p == nullptr || p->_right == nullptr) {
    return;
  }
  typename BST<T>::Node* r = p->_right;
  p->_right = r->_left;
  r->_left = p;
  p = r;
}

template <typename T>
const T& Tx::splay_find(BST<T>& tree, const T& x) {
  typename BST<T>::Node* n = BST<T>::_find(BST<T>::_root, x);
  if (n == nullptr) {
    throw BST<T>::Not_found_exception();
  }
  return n->_data;
}

template <typename T>
bool Tx::splay_contains(BST<T>& tree, const T& x) {
  return BST<T>::_find(BST<T>::_root, x) != nullptr;
}

void Tx::test() {
  BST<int>  bst;
  bst.insert(19);
  bst.insert(9);
  bst.insert(29);
  bst.insert(4);
  bst.insert(14);
  bst.insert(-1);
  bst.insert(24);
  bst.insert(34);
  bst.insert(35);
  bst.insert(36);
  bst.insert(39);

  bst.insert(38);

  int x = 37;

  cout << bst.to_string() << endl;

  _splay(bst._root, x);

  cout << bst.to_string() << endl;

  _splay(bst._root, x);

  cout << bst.to_string() << endl;

  _splay(bst._root, x);

  cout << bst.to_string() << endl;

  _splay(bst._root, x);

  cout << bst.to_string() << endl;

  _splay(bst._root, x);

  cout << bst.to_string() << endl;
}

#endif /* Tree_Algorithms_h */
