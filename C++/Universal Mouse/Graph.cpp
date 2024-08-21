//
//  Graph.cpp
//  Universal Mouse
//

#include "Graph.h"

string Graph::to_string() const {
  std::stringstream ss;
  ss << "# Graph - " << _nodes.size() << " nodes.\n";
  ss << "# Edge lists:\n";
  for (size_t i = 0; i < _nodes.size(); i++) {
    if (_nodes[i].size() > 0) {
      ss << i << " : " ;
    } else {
      continue;
    }
    
    for (size_t j = 0; j < _nodes[i].size(); j++) {
      ss << "(" << _nodes[i][j].dst << "," << _nodes[i][j].wt << ") ";
    }
    ss << "\n";
  }
  ss << "# End of Graph\n";
  return ss.str();
}

Graph& Graph::add_edge(int src, int tgt, float wt, bool replace) {
  if (_nodes.size() <= (size_t) src) {
    _nodes.resize(src + 1);
  }
  
  if (_nodes.size() <= (size_t) tgt) {
    _nodes.resize(tgt + 1);
  }
  
  if (src == tgt) {
    return *this;
  }
  
  //loop to find existing node with same destination
  size_t i = 0;
  for (; i < _nodes[src].size(); i++) {
    auto currNode = _nodes[src][i];
    // if true, replace dst, otherwise add dst to existing dst
    if (currNode.dst == tgt) {
      if (replace) {
        _nodes[src][i].wt = wt;
      } else {
        _nodes[src][i].wt += wt;
      }
      return *this;
    }
  }
  
  // no match found, insert new edge into node
  _nodes[src].resize(_nodes[src].size() + 1); // increase size
  Edge newEdge(tgt, wt);
  _nodes[src][i] = newEdge;
  
  return *this;
}

float Graph::find_edge_weight(int src, int tgt) const{
  if ((size_t) src > _nodes.size()) {
    return FLOOR;
  }
  
  // find edge and return weight
  for (size_t i = 0; i < _nodes.size(); i++) {
    if (_nodes[src][i].dst == tgt) {
      return _nodes[src][i].wt;
    }
  }
  
  //not found
  return FLOOR;
}
