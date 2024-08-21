//
//  Sparse.h
//  One stilted stilt on stilts
//
//  Created by Wolfgang Edholm on 4/16/21.
//

#ifndef Sparse_h
#define Sparse_h

#include "Matrix.h"
#include <list>

using std::list;

template <typename T>
class Sparse_Matrix {
private:
  static double constexpr FLOOR = 1e-10;
  
  struct Node { // private inner
    size_t _col;
    T _val;
    
    Node(size_t c, const T &v) : _col(c), _val(v) {}
    size_t get_col() const { return _col; }
    const T get_val() const { return _val; }
    void set_val(const T& val) { return _val = val; }
    
    friend ostream& operator<<(ostream& os, const Node &node) {
      return os << "{ C: " << node._col << ", V: " << node._val << " }";
    }
  };
  
  vector<list<Node> > _rows;
  size_t _num_rows, _num_cols;
  T _default_val;
  
public:
  Sparse_Matrix(size_t nr = 0, size_t nc = 0, const T &default_val = T())
    : _num_rows(nr), _num_cols(nc), _default_val(default_val) {
      _rows.resize(nr);
  }
  
  size_t get_num_rows() const { return _num_rows; }
  size_t get_num_cols() const { return _num_cols; }
  
  bool is_default(const T &val) const{
    if ((std::abs(val - _default_val) <= FLOOR) ){
      return true;
    }
    return false;
  }
  
  bool is_valid(size_t r, size_t c) const;
  void clear();
  const T get(size_t r, size_t c) const;
  bool set(size_t row, size_t col, const T &val);
  Matrix<T> get_slice(size_t r1, size_t c1, size_t r2, size_t c2) const; // rect slice
  
  friend class Tests;
};

template <typename T>
bool Sparse_Matrix<T>::is_valid(size_t r, size_t c) const {
  if (r >= _num_rows || c >= _num_cols) {
    return false;
  }
  return true;
}

template <typename T>
void Sparse_Matrix<T>::clear() {
  for (size_t i = 0; i < _rows.size(); i++) {
    _rows[i].clear();
  }
}

template <typename T>
const T Sparse_Matrix<T>::get(size_t r, size_t c) const {
  if (!is_valid(r, c)) {
    return _default_val;
  }
  for (auto it = _rows[r].begin(); it != _rows[r].end(); ++it) {
    if (it->_col > c) {
      return _default_val;
    }
    if (it->_col == c) {
      return it->_val;
    }
  }
  return _default_val;
}

template <typename T>
bool Sparse_Matrix<T>::set(size_t row, size_t col, const T &val) {
  if (row >= _num_rows || col >= _num_cols) {
    return false;
  }
  
  bool processed = false;
  for (auto it = _rows[row].begin(); it != _rows[row].end(); ++it) {
    if (it->_col > col) {
      if (!is_default(val)) {
        _rows[row].insert(it, Node(col, val));
      }
      processed = true;
      break;
    }
    if (it->_col == col) {
      processed = true;
      if (is_default(val)) {
        //commenting this out leads two 2 point loss
        _rows[row].erase(it);
        break;
      }
      it->_val = val;
      break;
    }
  }
  if (!processed && !is_default(val)) {
    _rows[row].push_back(Node(col, val));
  }
  return true;
}

template <typename T>
Matrix<T> Sparse_Matrix<T>::get_slice(size_t r1, size_t c1, size_t r2, size_t c2) const {
  if (r1 >= _num_rows || r2 >= _num_rows || c1 >= _num_cols || c2 >= _num_cols) {
    return Matrix<T>();
  }

  size_t rows = r2 - r1 + 1;
  size_t cols = c2 - c1 + 1;

  Matrix<T> matrix(rows, cols);

  for (size_t r = 0; r < rows; r++) {
    for (size_t c = 0; c < cols; c++) {
      T val = get(r + r1, c + c1);

      if (val != _default_val) {
        cout << "r: " << r << ", c: " << c << endl;
        T& mat = matrix.at(r, c);
        mat = val;
      }
    }
  }

  return matrix;
}

#endif /* Sparse_h */
