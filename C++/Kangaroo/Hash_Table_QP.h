
//  Hash_Table_QP.h
//  Kangaroo
//
//  Created by Wolfgang Edholm on 5/15/21.
//

#ifndef Hash_Table_QP_h
#define Hash_Table_QP_h

#include "Hash_Table_LP.h"
#include <math.h>

template <typename T>
class Hash_Table_QP : public Hash_Table_LP<T> {
public:
  Hash_Table_QP(size_t n = Hash_Table_LP<T>::DEFAULT_INIT_CAPACITY)
  : Hash_Table_LP<T>(n) { this->_max_load_factor = _get_biggest_allowed_max_load_factor();
  }
  
  void test() {
    Hash_Table_QP<int> potato;
    cout << potato._next_prime(31) << endl;
  }
  
protected:
  virtual float _get_biggest_allowed_max_load_factor() const;
  virtual size_t _find_pos(const T& item) const;
  virtual void _grow_capacity();
  
  // Private helper
  static size_t _next_prime(size_t n);
  
  static bool is_prime(size_t x);
  
  //iDon't modify below
  friend class Tests;
};

template <typename T>
float Hash_Table_QP<T>::_get_biggest_allowed_max_load_factor() const {
  return 0.49;
}

template <typename T>
size_t Hash_Table_QP<T>::_find_pos(const T &item) const{
  if (this->_num_non_vacant_cells == this->_elems.size()) {
    return std::string::npos;
  }
  size_t step = 1;
  size_t pos = this->_get_hash_modulus(item);
  while (this->_elems[pos]._data != item &&
         this->_elems[pos]._state != Hash_Table_LP<T>::Entry::STATE::VACANT) {
    pos += step;
    step += 2;
    while (pos >= this->_elems.size()) {
      pos -= this->_elems.size();
    }
  }
  return pos;
}

template <typename T>
void Hash_Table_QP<T>::_grow_capacity() {
  this->_elems.resize(_next_prime(2 * this->_elems.size()));
}

template <typename T>
bool Hash_Table_QP<T>::is_prime(size_t x) {
  if (x <= 1) {
    return false;
  }
  
  if (x <= 3) {
    return true;
  }
  
  if (x % 2 == 0 || x % 3 == 0) {
    return false;
  }
  
  for (size_t i = 5; i * i <= x; i += 6) {
    if (x % i == 0 || x % (i + 2) == 0) {
      return false;
    }
  }
  return true;
}

template <typename T>
size_t Hash_Table_QP<T>::_next_prime(size_t n) {
  if (n <= 1) {
    return 2;
  }
  
  while(!is_prime(n + 1)) {
    n += 1;
  }
  return n + 1;
}


#endif /* Hash_Table_QP_h */
