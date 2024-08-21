//
//  Graph_Algorithms.cpp
//  Universal Mouse
//

#include "Graph_Algorithms.h"

#include <queue>
#include <functional>
#include <list>
#include <iostream>
#include <limits.h>
#include <queue>
//using namespace std;

using std::list;
using std::queue;
using std::priority_queue;
using std::greater;
using std::min;

const int MAXVAL = 100000;

bool Gx::is_cyclic(const Graph &g) {
  if (g._nodes.size() == 0) {
    return false;
  }
  
  vector<bool> seen;
  vector<bool> free;
  
  seen.resize(g._nodes.size());
  free.resize(g._nodes.size());
  
  for (size_t i = 0; i < g._nodes.size(); i++) {
    if (_is_cyclic(g, i, seen, free)) {
      return true;
    }
  }
  return false;
}

bool Gx::_is_cyclic(const Graph &g, size_t node, vector<bool> seen, vector<bool> &cycle_free) {
  if (g._nodes[node].size() > 0) {
    for (size_t i = 0; i < g._nodes[node].size(); i++) {
      int dst = g._nodes[node][i].dst;
      
      if (seen[dst] == true) {
        return true;
      } else {
        seen[dst] = true;
        if (_is_cyclic(g, dst, seen, cycle_free)) {
          return true;
        }
      }
    }
  }
  
  cycle_free[node] = true;
  return false;
}

bool Gx::prune_unreachables(Graph &g, int src) {
  static vector<bool> seen;
  seen.resize(g._nodes.size());
  
  _prune_unreachables(g, src, seen);
  clear(g, seen);
  for (size_t i = 0; i < seen.size(); i++) {
    if (seen[i] == true) {
      cout << "seen: " << i << endl;
    } else {
      cout << "not seen: " << i << endl;
    }
  }
  
  for (size_t i = 0; i < seen.size(); i++) {
    seen[i] = false;
  }
  
  return true;
}

void Gx::_prune_unreachables(Graph &g, int src, vector<bool> &seen) {
  if (seen[src]) {
    return;
  }
  
  seen[src] = true;
  //cout << "seen: " << src << endl;
  for (size_t i = 0; i < g._nodes[src].size(); i++) {
    int dst = g._nodes[src][i].dst;
    _prune_unreachables(g, dst, seen);
  }
}

void Gx::clear(Graph &g, vector<bool> seen) {
  for (size_t node = 0; node < seen.size(); node++) {
    if (seen[node] == false) {
      g._nodes[node].resize(0);
    }
  }
}

size_t Gx::get_shortest_unweighted_path(const Graph &g, int src, int dst, vector<int> &path) {
  // a queue to maintain queue of vertices whose
  // adjacency list is to be scanned as per normal
  // DFS algorithm
  list<int> queue;
  
  vector<int> dist;
  dist.resize(g._nodes.size());
  
  vector<int> pred;
  pred.resize(g._nodes.size());

  // boolean array visited[] which stores the
  // information whether ith vertex is reached
  // at least once in the Breadth first search
  vector<bool> visited;
  visited.resize(g._nodes.size());

  // initially all vertices are unvisited
  // so v[i] for all i is false
  // and as no path is yet constructed
  // dist[i] for all i set to infinity
  for (size_t i = 0; i < g._nodes.size(); i++) {
    visited[i] = false;
    dist[i] = 10000;
    pred[i] = -1;
  }

  // now source is first to be visited and
  // distance from source to itself should be 0
  visited[src] = true;
  dist[src] = 0;
  
  queue.push_back(src);
  //cout << "src: " << src << endl;
  
  // standard BFS algorithm
  while (!queue.empty()) {
    int u = queue.front();
    //cout << "front: " << queue.front() << endl;
    queue.pop_front();
    
    for (size_t i = 0; i < g._nodes[u].size(); i++) {
      int dest = g._nodes[u][i].dst;
      
      //cout  << "dest: " << dest << endl;
      
      if (!visited[dest]) {
        //cout << "pushing node back\n";
        visited[dest] = true;
        dist[dest] = dist[u] + 1;
        pred[dest] = u;
        queue.push_back(dest);
        
        // We stop BFS when we find
        // destination.
        if (dest == dst) {
          int prev = dst;
          int total = dist[dest];
          
          // update path vector with nodes
          path.resize(total + 1);
          path[0] = src;
          path[total] = dst;
          
          for (size_t n = total - 1; n > 0; n--) {
            prev = pred[prev];
            path[n] = prev;
          }
          
          return dist[dest] + 1;
        }
      }
    }
  }

  //cout << "not found\n";*/
  path.resize(0);
  return string::npos;
}

size_t Gx::get_shortest_weighted_path(const Graph &g, int src, int dst, vector<int> &path) {
  /*size_t size = g._nodes.size();
  
  //check for exceptional cases
  if (src >= g._nodes.size() || dst >= g._nodes.size() || g._nodes[src].size() == 0) {
    path.resize(0);
    return string::npos;
  }
  
  // Create a priority queue to store vertices that
  // are being preprocessed.
  priority_queue<NW, vector<NW>, greater<NW>> pq;
  
  vector<NW> nodes;
  for (int i = static_cast<int>(size); i >= 0; i--) {
    nodes.insert(nodes.begin(), NW(i, -1, 10000));
  }

  cout << "hello\n";
  
  // NW Constructor: NW(int node, int pred, float weight)
  
  // Insert source itself in priority queue and initialize
  // its distance as 0.
  nodes[src].weight = 0;
  pq.push(nodes[src]);

  //Looping till priority queue becomes empty (or all
  //distances are not finalized)
  while (!pq.empty())
  {
    cout << "not empty\n" << endl;
    
    NW nw = pq.top();
    int u = pq.top().node;
    
    cout << "src: " << u << endl;
    pq.pop();
    
    if (nodes[u].weight < nw.weight) {
      // node already processed. This is a leftover
      continue;
    }
    
    // Get all adjacent of u.
    for (size_t i = 0; i < g._nodes[u].size(); i++)
    {
      // Get vertex label and weight of current adjacent
      // of u.
      int v = g._nodes[u][i].dst;
      
      float weight = g._nodes[u][i].wt;
      
      // If there is shorted path to v through u.
      if (nodes[v].weight > nodes[u].weight + weight)
      {
        // Updating distance of v
        nodes[v].weight = nodes[u].weight + weight;
        nodes[v].pred = u;
        pq.push(nodes[v]);
        //cout << "u: " << u << endl;
      }
    }
  }
  
  int u = dst;
  
  if (nodes[dst].pred == -1) {
    path.resize(0);
    return string::npos;
  }
  
  int path_size = 0;
  
  path.insert(path.begin(), src);
  path_size++;
  
  while(u != -1 && u != src) {
    path.insert(path.begin() + 1, u);
    u = nodes[u].pred;
    path_size++;
  }
  
  if (path_size <= 1) {
    path.resize(0);
    return string::npos;
  }
  
  path.resize(path_size);
  return path_size;*/
  size_t size = g._nodes.size();
  
  //check for exceptional cases
  if ((size_t) src >= g._nodes.size() || (size_t) dst >= g._nodes.size() || g._nodes[src].size() == 0) {
    path.resize(0);
    return string::npos;
  }
  
  // Create a priority queue to store vertices that
  // are being preprocessed.
  priority_queue<NW, vector<NW>, greater<NW>> pq;
  //priority_queue<NW, vector<NW>> pq;
  //priority_queue<NW> pq;
  
  vector<NW> nodes;
  for (int i = static_cast<int>(size); i >= 0; i--) {
    nodes.insert(nodes.begin(), NW(i, -1, MAXVAL));
  }
  
  // Insert source itself in priority queue and initialize
  // its distance as 0.
  nodes[src].weight = 0;
  pq.push(nodes[src]);

  //Looping till priority queue becomes empty (or all
  //distances are not finalized)
  while (!pq.empty()) {

    NW nw = pq.top();
    int u = nw.node;
    pq.pop();

    if (nodes[u].weight < nw.weight) {
      // node already processed. This is a leftover
      continue;
    }
    
    // cout << "popped src: " << u << " w = " << nw.weight << endl;
    
    // Get all adjacent of u.
    for (size_t i = 0; i < g._nodes[u].size(); i++) {
      // Get vertex label and weight of current adjacent
      // of u.
      int v = g._nodes[u][i].dst;
      NW* adjNode = &nodes[v];
      float possibleWeight = g._nodes[u][i].wt + nw.weight;
      int possibeDist = nw.weight + 1;
      
      //float weight = g._nodes[u][i].wt + nodes[u].weight;
      
      // If there is shorted path to v through u.
      if (adjNode->weight >= possibleWeight) {
        // Updating distance of v
        if (adjNode->weight > possibleWeight ||
            (adjNode->weight == possibleWeight && adjNode->weight > possibeDist)) {
          adjNode->weight = possibleWeight;
          adjNode->weight = possibeDist;
          adjNode->pred = u;
          pq.push(nodes[v]);
          //cout << "pushed: " << v << " w = " << nodes[v].weight << endl;
        }
        //cout << "u: " << u << endl;
      }
    }
  }
  
  int u = dst;
  
  if (nodes[dst].pred == -1) {
    path.resize(0);
    return string::npos;
  }
  
  int path_size = 0;
  
  path.insert(path.begin(), src);
  path_size++;
  
  while(u != -1 && u != src) {
    path.insert(path.begin() + 1, u);
    u = nodes[u].pred;
    path_size++;
  }
  
  if (path_size <= 1) {
    path.resize(0);
    return string::npos;
  }
  
  path.resize(path_size);
  return path_size;
}

float Gx::get_max_flow(const Graph &g, int src, int dst) {
  Graph rg;
  //create residual graph
  for (size_t i = 0; i < g._nodes.size(); i++) {
    for (size_t j = 0; j < g._nodes[i].size(); j++) {
      Graph::Edge edge = g._nodes[i][j];
      rg.add_edge((int) i, edge.dst, edge.wt);
    }
  }
  
  float total_flow = 0;
  
  for (;;) {
    vector<int> path;
    float flow = _get_max_capacity_path(rg, src, dst, path);
    
    if (flow == 0) {
      break;
    }
    
    total_flow += flow;
    
    //cout << "Extra flow = " << flow << endl;
    size_t end = path.size() - 1;
    //cout << "End = " << end << endl;
    for (size_t i = 0; i < end - 1; i++) {
      int v1 = path[i];
      int v2 = path[i + 1];
      //cout << "v1 = " << v1 << " v2 = " << v2 << endl;
      rg.add_edge(v1, v2, -flow, false);
      rg.add_edge(v2, v1, flow, false);
    }
    //cout << gg.to_string() << endl;
  }

  return total_flow;
}

// returns capacity/shortest edge in path
float Gx::_get_capacity_of_this_path(const Graph &g, const vector<int> &path) {
  /*float capacity = MAXVAL;

  size_t end = path.size() - 1;
  for (size_t i = 0; i < end; i++) {
    int v1 = path[i];
    int v2 = path[i + 1];
    for (size_t j = 0; j < g._nodes[v1].size(); j++) {
      if (g._nodes[v1][j].dst == v2) {
        if (g._nodes[v1][j].wt < capacity) {
          capacity = g._nodes[v1][j].wt;
          cout << i << ": " << v1 << " to " << v2 << " is " << g._nodes[v1][j].wt << endl;
        }
      }
    }
  }
  if (capacity == MAXVAL) {
    return 0;
  }*/
  //return capacity;
  return 0;
}

float Gx::_get_max_capacity_path(const Graph &g, int src, int dst, vector<int> &path) {
  int size = static_cast<int>(g._nodes.size());

  // Create a priority queue to store vertices that
  // are being preprocessed.
  priority_queue<NW> pq;
  
  vector<NW> nodes;
  for (int i = 0; i < size; i ++) {
    nodes.push_back(NW(i, -1, 0));
  }
  
  // Insert source itself in priority queue and initialize
  // its distance as 0.
  nodes[src].weight = MAXVAL;
  pq.push(nodes[src]);

  //Looping till priority queue becomes empty (or all
  //distances are not finalized)
  while (!pq.empty()) {
    NW nw = pq.top();
    int u = nw.node;
    pq.pop();
    
    if (nodes[u].weight < nw.weight) {
      // node already processed. This is a leftover
      continue;
    }
    
    for (size_t i = 0; i < g._nodes[u].size(); i++) {
      // Get vertex label and weight of current adjacent of u.
      int v = g._nodes[u][i].dst;

      float vFlowMax = std::min(g._nodes[u][i].wt, nodes[u].weight);
      
      // If there is larger path to v through u.
      if (vFlowMax > nodes[v].weight) {
        // Updating distance of v
        nodes[v].weight = vFlowMax;
        pq.push(nodes[v]);
        //cout << "pushed: " << v << " w = " << nodes[v].weight << endl;
        nodes[v].pred = u;
      }
    }
  }
  
  //cout << "queue empty\n";
  
  int u = dst;
  
  if (nodes[dst].pred == -1) {
    path.resize(0);
  }
  
  int path_size = 0;
   
  path.insert(path.begin(), src);
  path_size++;
  
  while(u != -1 && u != src) {
    //seen[u] = true;
    path.insert(path.begin() + 1, u);
    u = nodes[u].pred;
    
    //cout << "pred: " << u << endl;
    path_size++;
  }
  
  path.resize(path_size);
  
  if (nodes[dst].weight == MAXVAL) {
    return 0;
  }
  
  return nodes[dst].weight;
}

void Gx::test() {
  Graph g;
  
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
  
  g.add_edge(0, 2, 2);
  g.add_edge(0, 3, 3);
  g.add_edge(0, 9, 9);
  g.add_edge(1, 2, 101);
  g.add_edge(1, 7, 106);
  g.add_edge(2, 10, 210);
  g.add_edge(3, 9, 309);
  g.add_edge(4, 1, 401);
  g.add_edge(4, 0, 400);
  g.add_edge(4, 6, 405);
  g.add_edge(6, 0, 2400);
  g.add_edge(6, 8, 608);
  g.add_edge(8, 2, 802);
  g.add_edge(8, 6, 806);
  g.add_edge(9, 2, 902);
  g.add_edge(9, 7, 907);
  g.add_edge(10, 4, 1004);
  g.add_edge(10, 3, 1003);
  g.add_edge(10, 8, 1008);
  
  cout << g.to_string() << endl;
  
  vector<int> path;
  path.insert(path.begin(), 4);
  path.insert(path.begin(), 10);
  path.insert(path.begin(), 2);
  path.insert(path.begin(), 1);
  
  cout << "path: ";
  for (size_t i = 0; i < path.size(); i++) {
    cout << path[i] << " ";
  }
  cout << endl;
  
  
  cout << _get_capacity_of_this_path(g, path);
  
  /*cout << "Winning Combo: ";
  for (size_t i = 0; i < path.size(); i++) {
    cout << path[i] << " ";
  }
  cout << endl;*/
}
