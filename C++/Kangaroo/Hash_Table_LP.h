//
//  Hash_Table_LP.h
//  Kangaroo
//
//  Created by Wolfgang Edholm on 5/15/21.
//

#ifndef Hash_Table_LP_h
#define Hash_Table_LP_h

#include <iostream>
#include <vector>

using std::string;
using std::vector;
using std::cout;
using std::endl;

template <typename T>
size_t Hash(const T& item);

template <typename T>
size_t Hash(const T& item) {
  return item % 3;
}

template <typename T>
class Hash_Table_LP {
protected:
  struct Entry {
    T _data; // payload
    enum STATE { ACTIVE, VACANT, DELETED } _state;
    Entry(const T &d = T(), STATE st = VACANT) : _data(d), _state(st) {}
  };
  
  static const size_t DEFAULT_INIT_CAPACITY = 3; // first odd prime.
  vector<Entry> _elems;
  size_t _size;
  size_t _num_non_vacant_cells;
  float _max_load_factor;
  
  virtual size_t _get_hash_modulus(const T &item) const; //uses Hash(item), ext.
  virtual void _rehash();
  
  // Most common overrides
  virtual bool set_max_load_factor(float x);
  virtual float _get_biggest_allowed_max_load_factor() const;
  virtual size_t _find_pos(const T &item) const;
  virtual void _grow_capacity();
  
public:
  Hash_Table_LP(size_t n = DEFAULT_INIT_CAPACITY);
  
  size_t get_size() const { return _size; }
  bool is_empty() const { return _size == 0; }
  bool contains(const T &item) const;
  T &find (const T &item);
  bool clear();
  bool insert(const T &item);
  bool remove(const T &item);
  
  class Table_full_exception : public std::exception {
    public: const string to_string() const throw()
      { return string("Table full exception"); }
  };
  
  class Not_found_exception : public std::exception {
    public: const string to_string() const throw()
      { return string("Not found exception"); }
  };
  
  void test();
  void toString();
  
  friend class Tests;
};

template <typename T>
void Hash_Table_LP<T>::test() {
  Hash_Table_LP<int> potato;
  potato.insert(2);
  potato.insert(1);
  potato.insert(3);
  potato.insert(4);
  potato.insert(5);
  
  cout << _find_pos(1) << endl;
  cout << _find_pos(2) << endl;
  cout << _find_pos(3) << endl;
  cout << _find_pos(4) << endl;
  cout << _find_pos(5) << endl;
}

template <typename T>
Hash_Table_LP<T>::Hash_Table_LP(size_t n) {
  _elems.resize(n);
  _size = 0;
  _num_non_vacant_cells = 0;
  set_max_load_factor(0.75);
}

template <typename T>
float Hash_Table_LP<T>::_get_biggest_allowed_max_load_factor() const {
  return 0.75;
}

template <typename T>
size_t Hash_Table_LP<T>::_get_hash_modulus(const T &item) const {
  return Hash(item) % _elems.size();
}

template <typename T>
bool Hash_Table_LP<T>::set_max_load_factor(float x) {
  if (0 < x && x <= _get_biggest_allowed_max_load_factor()) {
    _max_load_factor = x;
    return true;
  }
  return false;
}

template <typename T>
void Hash_Table_LP<T>::_grow_capacity() {
  _elems.resize(_elems.size() * 2);
}

template <typename T>
void Hash_Table_LP<T>::_rehash() {
  vector<Entry> oldElems(_elems);
  _grow_capacity();
  _size = 0;
  _num_non_vacant_cells = 0;
  
  for (size_t i = oldElems.size(); 0 <i--;) {
    _elems[i]._state = Hash_Table_LP<T>::Entry::STATE::VACANT;
  }
  
  for (Entry elem : oldElems) {
    if (elem._state == Entry::STATE::ACTIVE) {
      insert(elem._data);
    }
  }
}

template <typename T>
size_t Hash_Table_LP<T>::_find_pos(const T &item) const {
  if (_num_non_vacant_cells == _elems.size()) {
    return string::npos;
  }
  
  size_t it = _get_hash_modulus(item);
  
  for (; ; it = (it + 1) % _elems.size()) {
    if (_elems[it]._data == item || _elems[it]._state == Entry::STATE::VACANT) {
      return it;
    }
  }
  return it;
}

template <typename T>
bool Hash_Table_LP<T>::contains(const T &item) const {
  auto it = _find_pos(item);
  if (_elems[it]._data == item) {
    return true;
  } else {
    return false;
  }
}

template <typename T>
T& Hash_Table_LP<T>::find(const T &item) {
  auto it = _find_pos(item);
  if (_elems[it]._data == item) {
    return _elems[it]._data;
  } else {
    throw Not_found_exception();
  }
}

template <typename T>
bool Hash_Table_LP<T>::insert(const T &item) {
  size_t it = _find_pos(item);
  if (it == string::npos || _elems[it]._state == Entry::STATE::ACTIVE) {
    return false;
  }
  
  if (_elems[it]._state != Entry::STATE::DELETED) {
    _elems[it]._data = item;
    _num_non_vacant_cells += 1;
  }
  
  _elems[it]._state = Entry::STATE::ACTIVE;
  _size += 1;
  
  if (_num_non_vacant_cells > _max_load_factor * _elems.size()) {
    _rehash();
  }
  
  return true;
}

template <typename T>
bool Hash_Table_LP<T>::remove(const T &item) {
  size_t it = _find_pos(item);
  if (it == string::npos) {
    throw Table_full_exception();
  }
  
  if (_elems[it]._data == item) {
    if (_elems[it]._state != Entry::STATE::DELETED) {
      _elems[it]._state = Entry::STATE::DELETED;
      _size -= 1;
      return true;
    }
  }
  return false;
}

template <typename T>
void Hash_Table_LP<T>::toString() {
  for (size_t i = 0; i < _elems.size(); i++) {
    if (_elems[i]._state == Entry::STATE::ACTIVE) {
      cout << "index: " << i << ": " << _elems[i]._data << endl;
    }
  }
  
  cout << "size: " << _size << "\n";
  cout << "non-vacant: " << _num_non_vacant_cells << endl;
}

#endif /* Hash_Table_LP_h */
