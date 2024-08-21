//
//  main.cpp
//  Universal Mouse
//

#include "Graph_Algorithms.h"

using std::cout;
using std::endl;


int main(int argc, const char * argv[]) {
  Graph g;
  vector<int> path;
  //path.insert(path.begin(), 6);
  //path.insert(path.begin(), 1);
  //path.resize(10);
  
  /*g.add_edge(0, 4, .0004);
  g.add_edge(2, 7, .0207);
  g.add_edge(3, 10, .031);
  g.add_edge(3, 7, 0.0307);
  g.add_edge(4, 7, 0.0407);
  g.add_edge(5, 15, 0.0515);
  g.add_edge(8, 0, 0.08);
  g.add_edge(8, 1, .0801);*/
  
  /*g.add_edge(0, 10, .001);
  g.add_edge(1, 4, .0208);
  g.add_edge(1, 3, .0103);
  g.add_edge(2, 5, .0205);
  g.add_edge(2, 10, 0.021);
  g.add_edge(3, 4, 0.0304);
  g.add_edge(3, 7, 0.0307);
  g.add_edge(3, 11, 0.0311);
  g.add_edge(4, 5, 0.0405);
  g.add_edge(4, 8, 0.0408);
  g.add_edge(5, 6, 0.0506);
  g.add_edge(5, 11, 0.0511);
  g.add_edge(5, 9, 0.0509);
  g.add_edge(6, 10, 0.122);
  g.add_edge(6, 1, 0.0601);
  g.add_edge(7, 2, 0.0702);
  g.add_edge(7, 1, 0.0701);
  g.add_edge(8, 2, 0.0802);
  g.add_edge(10, 1, 0.1001);
  g.add_edge(11, 4, 0.1104);
  g.add_edge(11, 1, 0.1101);
  g.add_edge(11, 13, 0.1113);
  g.add_edge(12, 14, 0.1214);
  g.add_edge(12, 6, 0.1206);
  g.add_edge(13, 5, 0.1305);
  g.add_edge(14, 0, 0.14);
  g.add_edge(14, 3, 0.1403);
  g.add_edge(14, 6, 0.1406);*/
  
  /*g.add_edge(0, 7, 6);
  g.add_edge(1, 6, 106);
  g.add_edge(2, 4, 203);
  g.add_edge(2, 1, 201);
  g.add_edge(3, 1, 602);
  g.add_edge(3, 0, 300);
  g.add_edge(4, 6, 405);
  g.add_edge(4, 2, 402);
  g.add_edge(5, 6, 506);
  g.add_edge(5, 2, 1004);
  g.add_edge(5, 4, 504);
  g.add_edge(5, 0, 500);
  g.add_edge(6, 10, 610);
  g.add_edge(7, 10, 710);
  g.add_edge(8, 1, 801);
  g.add_edge(8, 6, 806);
  g.add_edge(9, 4, 904);
  g.add_edge(9, 1, 901);
  g.add_edge(10, 6, 1001);*/
  
  //cout << g.to_string() << endl;
  
  Gx::test();
  
  //cout << "max flow from 12 to 4: " << Gx::get_max_flow(g, 12, 4) << endl;
  /*cout << "Winning Combo: ";
  for (size_t i = 0; i < path.size(); i++) {
    cout << path[i] << " ";
  }
  cout << endl;*/
  
  //cout << "shortest path from 10 to 13: " << Gx::get_shortest_weighted_path(g, 2, 6, path) << endl;
  
  /*cout << "Winning Combo: ";
  for (size_t i = 0; i < path.size(); i++) {
    cout << path[i] << " ";
  }
  cout << endl;*/
  
  //cout << g.to_string() << endl;
  
  return 0;
}
