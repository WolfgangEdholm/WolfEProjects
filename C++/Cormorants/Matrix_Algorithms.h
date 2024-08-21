//  Matrix_Algorithms.h
//  Cormorants
//
#ifndef Matrix_Algorithms_h
#define Matrix_Algorithms_h

#include "Matrix.h"
#include "Sparse_Matrix.h"
#include <iostream>

class Mx {
public:
  //static double constexpr FLOOR = 1e-10;
  template <typename T> static typename Sparse_Matrix<T>::Node potato(const Sparse_Matrix<T> a) {
    return typename Sparse_Matrix<T>::Node(4, 2);
  }
  
  template <typename T> static bool can_multiply(const Matrix<T> &a,
                                                const Matrix<T> &b) {
    return (a.get_num_cols() == b.get_num_rows());
  }
  
  template <typename  T> static bool multiply(const Matrix<T> &a,
                                              const Matrix<T> &b, Matrix<T> &res) {
    if (!can_multiply(a, b)) {
      return false;
    }
    
    T sum = 0;
    res = Matrix<T>(a.get_num_rows(), b.get_num_cols());
    
    for (size_t row = 0; row < a.get_num_rows(); row++) {
      for (size_t col = 0; col < b.get_num_cols(); col++) {
        
        for (size_t i = 0; i < a.get_num_cols(); i++) {
          sum += a._rows[row][i] * b._rows[i][col];
        }
        T &val = res.at(row, col);
        val = sum;
        sum = 0;
      }
    }
    
    return true;
  }
  
  // Sparse_Matrix utils -----------------------------------
  template<typename T> static bool can_multiply(const Sparse_Matrix<T> &a,
                                                const Sparse_Matrix<T> &b) {
    return a.get_num_cols() == b.get_num_rows();
  }
  
  template<typename T> static bool add_to_cell(Sparse_Matrix<T> &spmat, size_t r,
                                               size_t c, const T& val) {
    T cell = spmat.get(r, c) + val;
    return spmat.set(r, c, cell);
  }

  template <typename T> static bool multiply(
    const Sparse_Matrix<T> &a, const Sparse_Matrix<T> &b, Sparse_Matrix<T> &res ) {
    if (!can_multiply(a, b)) {
      return false;
    }
    
    res = Sparse_Matrix<T>(a._num_rows, b._num_cols);
    
    //search for non-empty rows
    for (size_t row = 0; row < a._rows.size(); row++) {
      auto alist = a._rows[row];
      if (alist.empty()) {
        continue;
      }
      
      //scan row first matrix for values
      for (auto it = alist.begin(); it != alist.end(); it++) {
        auto blist = b._rows[it->_col];
        
        // multiply values in row of matrix b that corresponds to col of value
        for (auto bt = blist.begin(); bt != blist.end(); bt++) {
          add_to_cell(res, row, bt->_col, it->_val * bt->_val);
        }
      }
    }
    return true;
  }
};

#endif /* Matrix_Algorithms_h */
