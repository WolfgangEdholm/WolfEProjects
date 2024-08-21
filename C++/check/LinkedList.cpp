//------------------- LinkedList.cpp --------------------
#include "LinkedList.h"

//Default contsructor
DoublyLinkedNode::DoublyLinkedNode()
{
   setData(Student());
   setPrevious(nullptr);
   setNext(nullptr);
}

//parameter constructor
DoublyLinkedNode::DoublyLinkedNode(Student theData,
              DoublyLinkedNode* previous, DoublyLinkedNode* next)
{
   setData(theData);
   setPrevious(previous);
   setNext(next);
}

//getter for data
Student* DoublyLinkedNode::getData()
{
   return &data;
}

//getter for next
DoublyLinkedNode* DoublyLinkedNode::getNext()
{
   return next;
}

//getter for previous
DoublyLinkedNode* DoublyLinkedNode::getPrevious()
{
   return previous;
}

//setter for data
bool DoublyLinkedNode::setData(Student theData)
{
   data = theData;
   return true;
}

//setter for next
bool DoublyLinkedNode::setNext(DoublyLinkedNode* pointer)
{
   next = pointer;
   return true;
}

//setter for previous
bool DoublyLinkedNode::setPrevious(DoublyLinkedNode* pointer)
{
   previous = pointer;
   return true;
}


//destructor
DoublyLinkedList::~DoublyLinkedList()
{
   for (DoublyLinkedNodePtr n = head; n != NULL;) {
      DoublyLinkedNodePtr next = n->getNext();
      delete n;
      n = next;
   }
}
