//
//  main.cpp
//  One stilted stilt on stilts
//
//  Created by Wolfgang Edholm on 4/16/21.
//


#include "Matrix.h"
#include "Sparse_Matrix.h"

int main() {
  Sparse_Matrix<int> sparse(4,2, 0);
  cout << sparse.get_num_cols() << endl;
  cout << sparse.get_num_rows() << endl;
}
