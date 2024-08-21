//
//  Matrix.h
//  One stilted stilt on stilts
//
//

#ifndef Matrix_h
#define Matrix_h

#include <iostream>
#include <iomanip>
#include <vector>
#include <sstream>

using std::vector;
using std::cout;
using std::endl;
using std::string;
using std::exception;
using std::ostream;
using std::stringstream;
using std::setw;

template <typename T>
class Matrix {
protected:
  vector<vector<T> > _rows;

private:
  size_t _nr;
  size_t _nc;

public:
  Matrix(size_t nr = 0, size_t nc = 0) : _nr(nr), _nc(nc){
    resize(nr, nc);
  }
  
  size_t get_num_rows() const { return _rows.size(); }
  size_t get_num_cols() const { return (_rows.size()>0? _rows[0].size() : 0); };
  
  void resize(size_t nr, size_t nc);
  T &at(size_t r, size_t c); // throws OOB
  
  string to_string() const;
  
  class OOB_exception : public exception {
    public: string what() { return "Out of bounds access"; }
  };
  
  // Friends ------------------------------------------
  
  friend ostream &operator << (ostream& os, const Matrix<T> &mat) {
    return os << mat.to_string();
  }
  
  friend bool operator==(const Matrix<T> &m1, const Matrix<T> &m2) {
    if (m1.get_num_rows() != m2.get_num_rows()) return false;
    if (m1.get_num_cols() != m2.get_num_cols()) return false;
    
    for (size_t i = 0; i < m1.get_num_rows(); i++) {
      for (size_t j = 0; j < m1.get_num_cols(); j++) {
        if (m1._rows[i][j] != m2._rows[i][j]) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  friend bool operator !=(const Matrix<T> &m1, const Matrix<T> &m2) {
    return !(m1 == m2);
  }
  
  friend class Mx;
  friend class Tests; // Don't remove this line
};

template <typename T>
void Matrix<T>::resize(size_t nr, size_t nc) {
  _rows.resize(nr);
  for (size_t row = 0; row < nr; row++) {
    _rows[row].resize(nc);
  }
}

template <typename T>
T& Matrix<T>::at(size_t r, size_t c) {
  if (r > _nr - 1 || c > _nc - 1) {
    throw OOB_exception();
  }
  
  //cout << _rows[r][c] << endl;
  return _rows[r][c];
}

template <typename T>
string Matrix<T>::to_string() const {
  stringstream ss;
  ss << "# Matrix\n";
  
  for (size_t row = 0; row < _nr; row++) {
    for (size_t col = 0; col < _nc; col++) {
      if (col > 0) {
        ss << " ";
      }
      ss << setw(6) << _rows[row][col];
    }
    ss << "\n";
  }
  return ss.str();
}

#endif /* Matrix_h */
