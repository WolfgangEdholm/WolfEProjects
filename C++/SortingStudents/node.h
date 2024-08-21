
#ifndef node_h
#define node_h

class IntNode
{
public:
   IntNode() {}
   IntNode(int theData, IntNode* theLink)
      : data(theData), link(theLink) {}
   IntNode* getLink() const {return link;}
   int getData() const {return data;}
   void setData(int theData) {data = theData;}
   void setLink(IntNode* pointer) {link = pointer;}
private:
   int data;
   IntNode *link;
};
typedef IntNode* IntNodePtr;

#endif /* node_h */
