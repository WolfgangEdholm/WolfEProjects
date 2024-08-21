//
//  Special_Heap.h
//  A butterfly in baltimore
//
//  Created by Wolfgang Edholm on 5/24/21.
//

#ifndef Special_Heap_h
#define Special_Heap_h

#include "Heap.h"

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
  
  /*if (k <= this->_size) {
    for (size_t i = 0; i < k; i++) {
      T min = this->peek_min();
      this->delete_min();
      this->_elems[this->_size + 1] = min;
    }
    this->_size = 0;
  }
  return this->_elems;*/
}

#endif /* Special_Heap_h */
