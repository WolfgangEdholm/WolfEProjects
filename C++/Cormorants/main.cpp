//
//  main.cpp
//  Cormorants
//
//  Created by Wolfgang Edholm on 4/18/21.
//

#include "Matrix.h"
#include "Sparse_Matrix.h"
#include <iostream>
#include <list>
#include "Matrix_Algorithms.h"


int main() {


  Sparse_Matrix<float> t1(100000, 100000);

  t1.set(286, 3524, .637);
  cout << "TEST " << t1.get(286, 3524) << endl;

  Sparse_Matrix<int> m1(2, 3);
  Sparse_Matrix<int> m2(3, 2);
  Sparse_Matrix<int> m3;

  m1.set(0, 0, 1);
  m1.set(0, 1, 2);
  m1.set(0, 2, 3);
  m1.set(1, 0, 4);
  m1.set(1, 1, 5);
  m1.set(1, 2, 6);

  m2.set(0, 0, 7);
  m2.set(0, 1, 8);
  m2.set(1, 0, 9);
  m2.set(1, 1, 10);
  m2.set(2, 0, 11);
  m2.set(2, 1, 12);

  Mx::multiply(m1, m2, m3);
  cout << m1.to_str();
  cout << m2.to_str();
  cout << m3.to_str();

  Mx::potato(m1);
  
//  //cout << mat1.get_slice(0, 0, 2, 3).to_string();
//  cout << mat1.to_str();
//  cout << mat2.to_str();
//  cout << mat3.to_str();

//  Sparse_Matrix<int> mat1(25, 25);
//  Sparse_Matrix<int> mat2(25, 25);
//  Sparse_Matrix<int> mat3;
//
//  mat1.set(3, 3, -5);
//  mat1.set(3, 4, -5);
//  mat1.set(3, 5, 3);
//  mat1.set(4, 3, -4);
//  mat1.set(4, 4, -1);
//  mat1.set(4, 5, 3);
//  mat1.set(5, 3, -3);
//  mat1.set(5, 4, 1);
//
//  mat2.set(0, 4, -3);
//  mat2.set(1, 2, -1);
//  mat2.set(2, 0, 4);
//  mat2.set(4, 4, 3);
//  mat2.set(4, 6, -2);
//  mat2.set(5, 1, 4);
//
//  Mx::multiply(mat1, mat2, mat3);

//  Sparse_Matrix<double> mat1(25, 25);
//  Sparse_Matrix<double> mat2(25, 25);
//  Sparse_Matrix<double> mat3;
//
//  mat1.set(2, 2, 2);
//  mat1.set(2, 3, 3);
//  mat1.set(3, 2, -4);
//
//  mat2.set(3, 0, -1);
//
//  Mx::multiply(mat1, mat2, mat3);

//  Sparse_Matrix<int> mat1(25, 25);
//  Sparse_Matrix<int> mat2(25, 25);
//  Sparse_Matrix<int> mat3;
//
//  mat1.set(4, 4, 1);
//  mat1.set(4, 7, 2);
//  mat1.set(5, 4, -4);
//  mat1.set(5, 6, 1);
//  mat1.set(5, 7, 3);
//  mat1.set(6, 4, -1);
//  mat1.set(6, 6, -5);
//  mat1.set(6, 7, -5);
//  mat1.set(7, 4, -2);
//  mat1.set(7, 7, 4);
//
//  mat2.set(0, 2, -2);
//  mat2.set(1, 1, -3);
//  mat2.set(1, 3, -2);
//  mat2.set(2, 6, -2);
//  mat2.set(3, 0, 1);
//  mat2.set(3, 2, 3);
//  mat2.set(3, 8, -5);
//  mat2.set(4, 2, -4);
//  mat2.set(5, 1, -3);
//  mat2.set(5, 8, -2);
//  mat2.set(7, 2, -5);
//  mat2.set(8, 5, 2);
//
//  Mx::multiply(mat1, mat2, mat3);
//
//  cout << mat1.to_str();
//  cout << mat2.to_str();
//  cout << mat3.to_str();
//


}
