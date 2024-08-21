//  Header.h
//  A butterfly in baltimore

#ifndef Header_h
#define Header_h

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

//template <typename T>
//T get_sentinel() {
  //return 0;
//}

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
  
public:
  Heap();
  Heap(const vector<T>& vec);
  
  virtual bool is_empty() const { return _size == 0; }
  virtual bool insert(const T &elem);
  virtual bool delete_min();
  virtual const T &peek_min() const;
  
  virtual string to_string() const;
  
  class Exception : std::exception { };
  
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
string Heap<T>::to_string() const {
  stringstream ss;
  if (is_empty()) {
    return "";
  }
  
  ss << "# Heap with min = n" << endl; //<< _elems[1] << endl;
  ss << "# Size = n" << endl; //_size << endl;
  size_t k = 1;
  size_t left = 2 * k;
  size_t right = 2 * k + 1;
  
  while (left <= _size) {
    ss << _elems[k] << " : ";
    
    //left child
    ss << _elems[left] << " ";
    
    //right child
    if (right <= _size) {
      ss << _elems[right];
    } else {
      ss << "-";
    }
    ss << endl;
    k++;
    left = 2 * k;
    right = 2 * k + 1;
  }
  ss << "# End of heap\n";
  
  return ss.str();
}

#endif /* Header_h */
