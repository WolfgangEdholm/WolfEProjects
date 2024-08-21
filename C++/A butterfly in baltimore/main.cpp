//
//  main.cpp
//  A butterfly in baltimore
//
//  Created by Wolfgang Edholm on 5/24/21.
//

#include <iostream>
#include <sstream>
#include <vector>

using std::vector;
using std::cout;
using std::endl;
using std::string;
using std::stringstream;

// client supplied funciton
// take away definition when submitting!

template <typename T>
T get_sentinel();

template <typename T>
T get_sentinel() {
  return 0;
}

// - T must implement operator<() via get_sentinel<T>() { return min possible
// - The max size of a heap = capacity - 1 because elem 0 is a sentinel
// - Capacity is simply elems.size() (= max_size + 1)

template <typename T>
class Heap {
protected:
  vector<T> _elems;
  size_t _size;
  static const int INIT_HEAP_CAPACITY = 128;
  
  //private helpers
  bool _percolate_down(size_t pos);
  bool _heapify();
  string _to_string(size_t elem) const;
  
  
public:
  Heap();
  Heap(const vector<T>& vec);
  
  virtual bool is_empty() const { return _size == 0; }
  virtual bool insert(const T &elem);
  virtual bool delete_min();
  virtual const T &peek_min() const;
  
  virtual string to_string() const;
  
  class Exception : std::exception { };
  
  void tests();
  
  friend class Tests; // Don't remove this line
};

//constructors
template <typename T>
Heap<T>::Heap() {
  _elems.resize(INIT_HEAP_CAPACITY);
  _elems[0] = get_sentinel<T>();
  _size = 0;
}

template <typename T>
Heap<T>::Heap(const vector<T> &vec){
  _size = vec.size();
  _elems.resize(_size + 1);
  
  for (size_t i = 0; i < _size; i++) {
    _elems[i + 1] = vec[i];
  }
  _elems[0] = get_sentinel<T>();
  _heapify();
}

template <typename T>
bool Heap<T>::_percolate_down(size_t pos) {
  size_t child;
  T tmp;
  
  //runs until both children are greater than pos or no children exist
  for ( tmp = _elems[pos]; 2 * pos <= _size; pos = child) {
    child = 2 * pos; // left child
    // if 2 children, get the lesser of the two
    if (child < _size && _elems[child + 1] < _elems[child])
      child++;
    if (_elems[child] < tmp)
      _elems[pos] = _elems[child];
    else
      break;
  }
  _elems[pos] = tmp;
  return true;
}

template <typename T>
bool Heap<T>::_heapify() {
  for (size_t i = _size / 2; i > 0; i--) {
    _percolate_down(i);
  }
  return true;
}

template <typename T>
bool Heap<T>::insert(const T &elem) {
  size_t hole = _size + 1;
  
  if (_size == _elems.size() - 1) {
    _elems.resize(_elems.size() * 2);
  }
  
  //percolate up until root is reached or parent is smaller than elem
  for ( ; hole > 1 && elem < _elems[hole / 2]; hole /= 2 ) {
    //cout << "hole: " << hole << endl;
    _elems[hole] = _elems[hole/2];
  }
  //cout << "hi\n";
  _elems[hole] = elem;
  _size += 1;
  //cout << "size: " << _size << endl;
  return true;
}

template <typename T>
bool Heap<T>::delete_min() {
  if (is_empty()) {
    return false;
  }
  
  _elems[1] = _elems[_size];
  _percolate_down(1);
  _size--;
  return true;
}

template <typename T>
const T & Heap<T>::peek_min() const {
  if (is_empty()) {
    return _elems[0]; //return sentinel if empty
  }
  
  return _elems[1]; // min located at root
}

template <typename T>
void Heap<T>::tests() {
  Heap<int> test;
  test.insert(10);
  test.insert(7);
  test.insert(5);
  test.insert(6);
  test.insert(4);
  test.insert(9);
  test.insert(8);
  test.insert(3);
  test.insert(1);
  test.insert(2);
  
  //cout << "size: " << test._size << endl;
  //cout << "elem 1: " << test._elems[3] << endl;
  cout << test.to_string() << endl;
}

template <typename T>
class Special_Heap : public Heap<T> {
public:
  Special_Heap() : Heap<T>() {}
  Special_Heap(const vector<T> &vec) : Heap<T>(vec) {}
  
  const vector<T> &get_least_k(size_t k);
  
  friend class Tests;
};

template <typename T>
const vector<T>& Special_Heap<T>::get_least_k(size_t k) {
  // heap not large enough for request
  if (k > this->_size) {
    return this->_elems;
  }
  
  T min;
  
  for (size_t i = 0; i < k; i++) {
    min = this->peek_min();
    this->delete_min();
    this->_elems[this->_size + 1] = min;
  }
  this->_size = 0;
  return this->_elems;
}

int main(int argc, const char * argv[]) {
  Heap<int> potato;
  Special_Heap<int> special;
  
  special.get_least_k(1);
  potato.tests();
  
  return 0;
}
