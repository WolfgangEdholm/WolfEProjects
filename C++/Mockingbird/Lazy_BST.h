//  Lazy_BST.h
//  Mockingbird
//
//  Created by Wolfgang Edholm on 4/21/21.
//

#ifndef Lazy_BST_h
#define Lazy_BST_h

#include <iostream>
#include <sstream>

using std::string;
using std::cout;
using std::endl;
using std::stringstream;

template <typename T>
class Lazy_BST {
protected:
  struct Node {
    T _data;
    Node *_left, *_right;
    bool _is_deleted;

    Node (const T &d) : _data(d), _left(nullptr), _right(nullptr),
      _is_deleted(false) { }

    //copy constructor
    Node(const Node* that);

  };

  Node *_root;
  size_t _size, _real_size;

  //helpers
  //static Node *_deep_copy(const Node *p);

  //Private Helpers
  bool _recursive_delete(Node *&p);
  bool _insert(Node*& p, const T& elem);
  bool _remove(Node*& p, const T& elem);
  bool _collect_garbage(Node*& p);
  const Node* _find_min(Node*& p) const;
  const Node* _find(Node* p, const T& elem) const;
  const Node* _find_real_min(const Node* p) const;
  bool _really_remove(Node*& p, const T& elem);
  //bool _really_remove_node(Node*& p);
  string _to_string(const Node* p) const;

public:
  Lazy_BST() : _root(nullptr), _size(0), _real_size(0) {}
  ~Lazy_BST() { clear(); }

  size_t get_size() const { return _size; }
  size_t get_real_size() const { return _real_size; }
  bool insert(const T &elem) { return _insert(_root, elem); }
  bool remove(const T &elem) { return _remove(_root, elem); }
  bool really_remove(const T &elem) {
    _find(_root, elem);
    return _remove(_root, elem); }
  bool collect_garbage() { return _collect_garbage(_root); }
  bool contains(const T &elem) const { return _find(_root, elem); }
  
  const T& find(const T &elem) const {
    if (_find(_root, elem) == nullptr) {
      throw Not_found_exception();
    } else {
      return _find(_root, elem)->_data;
    }
  }
  
  string to_string() const;
  bool clear();
  class Not_found_exception : public std::exception {
  public:
    string what() { return "Element not found exception"; }
  };

  void tt();

  friend class Tests;
};

template <typename T>
Lazy_BST<T>::Node::Node(const Node* that): Node() {
  if (that == nullptr) {
    return;
  }
  
  _data = that->_data;
  _is_deleted = that->_is_deleted;
  
  if (that->_left != nullptr) {
    _left = new Node(that->_left);
  }
  
  if (that->_right != nullptr) {
    _right = new Node(that->_right);
  }
}
  
  //Private Helpers

template <typename T>
bool Lazy_BST<T>::_insert(Node*& p, const T& elem) {
  if (p == nullptr) {
    _real_size += 1;
    _size += 1;
    p = new Node(elem);
    return true;
  }
  if (elem < p->_data) {
    return _insert(p->_left, elem);
  }
  if (p->_data < elem) {
    return _insert(p->_right, elem);
  }
  if (p->_data == elem) {
    if (p->_is_deleted) {
      p->_is_deleted = false;
      return true;
    }
  }
  return false; // duplicate
}

template <typename T>
bool Lazy_BST<T>::_remove(Node*& p, const T& elem) {
  if (p == nullptr) {
    return false;
  }
  if (elem < p->_data) {
    return _remove(p->_left, elem);
  }
  if (p->_data < elem) {
    return _remove(p->_right, elem);
  }
  if (p->_is_deleted) {
    return false;
  }
  p->_is_deleted = true;
  _size -= 1;
  return true;
}

template <typename T>
bool Lazy_BST<T>::_recursive_delete(Node*& p) {
  if (p == nullptr) {
    return true;
  }
  if (p->_left != nullptr) {
    //cout << "left\n";
    auto q = p->_left;
    _recursive_delete(q);
    p->_left = nullptr;
  }
  if (p->_right != nullptr) {
    //cout << "right\n";
    auto q = p->_right;
    _recursive_delete(q);
    p->_right = nullptr;
  }
  std::cout << "deleting " << p->_data << endl;
  _size -= 1;
  delete p;
  p = nullptr;
  return true;
}

template <typename T>
const typename Lazy_BST<T>::Node* Lazy_BST<T>::_find_min(Node*& p) const {
  //if no root node, return nullptr
  if (p == nullptr) {
    return nullptr;
  }
  
  //Find smallest value on left
  if (p->_left != nullptr) {
    const Node* leftMin = _find_min(p->_left);
    if (leftMin != nullptr) {
      return leftMin;
    }
  }
  
  //If no values on left, return root if not deleted
  if (!p->_is_deleted) {
    return p;
  }
  
  //Find the smallest value on the right
  if (p->_right != nullptr) {
    const Node* rightMin = _find_min(p->_right);
    if (rightMin != nullptr) {
      return rightMin;
    }
  }
  return nullptr;
}

template <typename T>
const typename Lazy_BST<T>::Node* Lazy_BST<T>::_find(Node *p, const T &elem) const {
  if (p == nullptr) {
    return nullptr;
  }
  if (elem < p->_data) {
    return _find(p->_left, elem);
  }
  if (p->_data < elem) {
    return _find(p->_right, elem);
  }
  //Elem found
  if (p->_is_deleted) {
    return nullptr;
  }
  return p;
}

template <typename T>
bool Lazy_BST<T>::_collect_garbage(Node *&p) {
  if (p == nullptr) {
    return false;
  }
  bool newDeleted = false;
  if (p != nullptr && p->_left != nullptr) {
    newDeleted |= _collect_garbage(p->_left);
    //deleted |= newDeleted;
  }
  if (p != nullptr && p->_right != nullptr) {
    newDeleted |= _collect_garbage(p->_right);
    //deleted |= newDeleted;
  }
  while (p != nullptr && p->_is_deleted) {
    newDeleted |= _really_remove(p, p->_data);
    //deleted |= newDeleted;
  }
  return newDeleted;
}
  
template <typename T>
const typename Lazy_BST<T>::Node* Lazy_BST<T>::_find_real_min(const Node *p) const {
  //not found
  if (p == nullptr) {
    return nullptr;
  }
  while (p->_left != nullptr) {
    p = p->_left;
  }
  return p;
}

template <typename T>
bool Lazy_BST<T>::_really_remove(Node *&p, const T &elem) {
  if (p == nullptr) {
    return false;
  }
  if (elem < p->_data) {
    return _really_remove(p->_left, elem);
  }
  if (p->_data < elem) {
    return _really_remove(p->_right, elem);
  }

  //found the node
  if (p->_left != nullptr && p->_right != nullptr) {
    const Node* minNode = _find_min(p->_right);
    p->_data = minNode->_data;
    p->_is_deleted = minNode->_is_deleted;
    _really_remove(p->_right, minNode->_data);
  } else {
    Node* nodeToRemove = p;
    p = (p->_left != nullptr) ? p->_left : p->_right;
    _real_size -= 1;
    delete nodeToRemove;
    nodeToRemove = nullptr;
  }
  return true;
}

template <typename T>
string Lazy_BST<T>::_to_string(const Node *p) const {
  stringstream ss;
  
  if (!(p->_left == nullptr && p->_right == nullptr)) {
    ss << p->_data;
    if (p->_is_deleted) {
      ss << "*";
    }
    ss << " : ";
    if (p->_left != nullptr) {
      ss <<  p->_left->_data;
      if (p->_left->_is_deleted) {
        ss << "*";
      }
    } else {
      ss << "[null]";
    }

    ss << " ";

    if (p->_right != nullptr) {
      ss <<  p->_right->_data;
      if (p->_right->_is_deleted) {
        ss << "*";
      }
    } else {
      ss << "[null]";
    }
    ss << endl;
  }

  if (p->_left != nullptr) {
    ss << _to_string(p->_left);
  }

  if (p->_right != nullptr) {
    ss << _to_string(p->_right);
  }

  return ss.str();
}

template <typename T>
string Lazy_BST<T>::to_string() const {
  stringstream ss;
  ss << "# Tree rooted at " << _root->_data;
  if(_root->_is_deleted) {
    ss << "*";
  }
  ss << endl;
  ss << "# size = " << _size << endl;
  ss << _to_string(_root);
  ss << "# End of Tree\n";
  return ss.str();
}

template <typename T>
bool Lazy_BST<T>::clear() {
  _size = 0;
  _real_size = 0;
  return _recursive_delete(_root);
}

template <typename T>
void Lazy_BST<T>::tt() {
  cout << "ROOT " << _root << " LEFT " << _root->_left << " RIGHT " << _root->_right << endl;
}

#endif /* Lazy_BST_h */
