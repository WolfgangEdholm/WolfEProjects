//
//  Graph_Algorithms.h
//  Universal Mouse
//

#ifndef Graph_Algorithms_h
#define Graph_Algorithms_h

#include "Graph.h"

class Gx {
private:
  struct NW { // package three co-used qtys
    int node, pred;
    float weight;
    
    NW(int n, int m, float wt) : node(n), pred(m), weight(wt) {}
    bool operator<(const NW &that) const { return this->weight > that.weight; }
    bool operator>(const NW &that) const { return this->weight < that.weight; }
  };
  
  static float _get_capacity_of_this_path(const Graph &g, const vector<int> &path);
  static float _get_max_capacity_path(const Graph &g, int src, int dst, vector<int> &path);
  static bool _is_cyclic(const Graph &g, size_t node, vector<bool> seen, vector<bool>& cycle_free);
  
public:
  static bool is_cyclic(const Graph &g);
  static bool prune_unreachables(Graph &g, int src);
  static void _prune_unreachables(Graph &g, int src, vector<bool> &seen);
  
  static void clear(Graph &g, vector<bool> seen);
  
  static size_t get_shortest_unweighted_path(const Graph &g, int src, int dst, vector<int> &path);
  static size_t get_shortest_weighted_path(const Graph &g, int src, int dst, vector<int> &path);
  
  static float get_max_flow(const Graph &g, int src, int dst);
  
  static void test();
  
  friend class Tests; // Don't remove
};

#endif /* Graph_Algorithms_h */
