
//  Pivoting.h
//  chump - the shark
//
//  Created by Wolfgang Edholm on 5/20/21.
//

#ifndef Pivoting_h
#define Pivoting_h

#include <iostream>
#include <vector>

using std::vector;
using std::cout;
using std::endl;

template <typename T>
class Pivoting {
private:
  static size_t _partition(vector<T> &elems, size_t lo, size_t hi);
  static void _do_qsort(vector<T> &elems, size_t lo, size_t hi);
  static T _find_kth_least_elem(vector<T> &elems, size_t lo, size_t hi, size_t k);
  
public:
  static T find_median(vector<T> &elems);
  static T find_kth_least_elem(vector<T> &elems, size_t k);
  static void do_qsort(vector<T> &elems);
  
  void test();
  
  friend class Tests;
};

template <typename T>
size_t Pivoting<T>::_partition(vector<T> &elems, size_t lo, size_t hi) {
  if (hi <= lo) {
    return hi;
  }
  
  size_t index = lo + (hi - lo) / 2;
  T pivot = elems[index];
  
  size_t left = lo;
  size_t right = hi;
  
  while (true) {
    while (elems[left] < pivot) {
      left++;
    }
    
    while (pivot < elems[right]) {
      right--;
    }
    
    if (left >= right) {
      return right;
    } else {
      std::swap(elems[left], elems[right]);
      left++;
      right--;
    }
  }
  return right;
}

template <typename T>
void Pivoting<T>::_do_qsort(vector<T> &elems, size_t lo, size_t hi) {
  size_t p = _partition(elems, lo, hi);
  
  if (hi - lo >= 1) {
    _do_qsort(elems, lo, p);
    _do_qsort(elems, p + 1, hi);
  }
}

template <typename T>
T Pivoting<T>::_find_kth_least_elem(vector<T> &elems, size_t lo, size_t hi, size_t k) {
  if (lo >= hi) {
    return elems[lo];
  }
  
  size_t p = _partition(elems, lo, hi);
  
  if (k <= p) {
    return _find_kth_least_elem(elems, lo, p, k);
  } else { // k <= p
    return _find_kth_least_elem(elems, p + 1, hi, k);
  }
}

template <typename T>
T Pivoting<T>::find_median(vector<T> &elems) {
  size_t median = elems.size() / 2;
  return find_kth_least_elem(elems, median);
}

template <typename T>
T Pivoting<T>::find_kth_least_elem(vector<T> &elems, size_t k) {
  if (k >= elems.size()) {
    return T();
  }
  return _find_kth_least_elem(elems, 0, elems.size() - 1, k);
}

template <typename T>
void Pivoting<T>::do_qsort(vector<T> &elems) {
  _do_qsort(elems, 0, elems.size() - 1);
}

template <typename T>
void Pivoting<T>::test() {
  //Pivoting<int> pivot;
  vector<int> vec;
  //cout << "Before sort\n";
  
  vec.push_back(-2);
  vec.push_back(8);
  vec.push_back(-3);
  vec.push_back(10);
  //vec.push_back(8);
  vec.push_back(2);
  vec.push_back(9);
  vec.push_back(12);
  vec.push_back(13);
  
  cout << "elem\n";
  cout << find_median(vec) << endl << endl;
  
  do_qsort(vec);
  
  cout << "\nAfter sort" << endl;
  for (size_t i = 0; i < vec.size(); i++) {
    cout << vec[i] << endl;
  }
}

#endif /* Pivoting_h */
