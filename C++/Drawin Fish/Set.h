//  Set.h
//  Drawin Fish
//
//  Created by Wolfgang Edholm on 4/14/21.
//

#ifndef Set_h
#define Set_h

#include <iostream>
#include <vector>

using std::vector;
using std::ostream;
using std::cout;
using std::endl;

template <typename T>
class Set {
private:
  vector<T> *_master_ptr;
  vector<size_t> _elems;
  size_t _sum;
  
public:
  Set(vector<T> *mast_ptr = nullptr) : _master_ptr(mast_ptr), _sum(0) {
    //cout << "size: " << mast_ptr->size() << endl;
  }

  static size_t get_duration(T t) { return (size_t) static_cast<int>(t); }
  
  const size_t size() const { return _elems.size(); }
  const vector<T> *get_master_ptr() { return _master_ptr; }
  const size_t get_sum() const { return _sum; }
  
  bool add_elem(size_t n);
  bool add_all_elems();

  Set<T> find_biggest_subset_le(size_t target);
  
  friend ostream & operator << (ostream& os, Set<T> &set)
  {
    const vector<T> *mast_ptr = set.get_master_ptr();
    os << "{\n";
    for (size_t index : set._elems) {
      os << " " << mast_ptr->at(index) << "\n";
    }
    return os << "}";
  }
  friend class Tests;
};

template <typename T> bool Set<T>::add_elem(size_t n) {
  if (_master_ptr != nullptr && n < _master_ptr->size()) {
    T t = _master_ptr->at(n);
    _sum = _sum + t;
    
    _elems.push_back(n);
    return true;
  }
  return false;
} // n is the index in master

template <typename T> bool Set<T>::add_all_elems() {
  bool isOk = true;
  for (size_t i = 0; i < _master_ptr->size(); i++) {
    //_sum += (size_t)_master_ptr->at(i);
    isOk &= add_elem(i);
    //cout << "sum: " << _sum << endl;
  }
  return isOk;
}

template <typename T> Set<T> Set<T>::find_biggest_subset_le(size_t target) {
  if (target == 0) {
    return Set<T>();
  }
  
  Set<T> base;
  
  size_t zero = base.get_sum();
  
  add_all_elems();
  
  if (target > _sum) {
  //if (target + zero > _sum) {
    cout << "adding all\n";
    return *this;
  }
  
  for (size_t i = 0; i < _elems.size(); i++) {
    if (zero + _master_ptr->at(_elems[i]) > target) {
      _elems.erase(_elems.begin() + i);
      size_t temp = zero + _master_ptr->at(_elems[i]);
      _sum = _sum - temp;
      
    } else if (zero + _master_ptr->at(_elems[i]) == target) {
      size_t temp = _elems[i];
      _sum = zero + _master_ptr->at(_elems[i]);
      _elems.clear();
      _elems.push_back(temp);
      return *this;
    }
  }
  
  _sum = 0;
  
  vector<Set<T>> sets;
  vector<Set<T>> addSets;
  
  sets.push_back(Set<T>());
  Set<T> largestSet;
  
  cout << "size: " << _master_ptr->size() << endl;
  
  for (size_t i = 0; i < _master_ptr->size(); i++) {
    for (size_t j = 0; j < sets.size(); j++) {
      Set<T> currSet = sets[j];
      
      cout << "element: " <<  j << endl;
      
      currSet._master_ptr = _master_ptr;
      
      currSet.add_elem(i);
      
      cout << "sum: " << currSet._sum << endl;
      cout << currSet << endl << endl;
      
      if (currSet.get_sum() == base.get_sum() + target) {
        cout << "hello there\n";
        return currSet;
      }
      
      if (currSet.get_sum() < target) {
        addSets.push_back(currSet);
      }
      
      if (currSet.get_sum() > largestSet.get_sum()
          && currSet.get_sum() < target + base.get_sum()) {
        largestSet = currSet;
      }
    }
    
    cout << "set size: " << addSets.size() << endl;
    
    for (size_t num = 0; num < addSets.size(); num++) {
      sets.push_back(addSets[num]);
    }
    
    addSets.clear();
  }

  return largestSet;
}

//template <typename T> ostream & operator << (ostream& os, Set<T> &set) {
//  const vector<T> *mast_ptr = set.get_master_ptr();
//  os << "{\n";
//  for (size_t index : set._elems) {
//    os << " " << mast_ptr->at(index) << "\n";
//  }
//  return os << "}";
//}

#endif /* Set_h */
