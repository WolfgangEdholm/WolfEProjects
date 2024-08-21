//------------------- LinkedList.h --------------------
#ifndef linkedlist_h
#define linkedlist_h

#include "Student.h"

//Object that points to others of the same type
class DoublyLinkedNode
{
public:
   //constructors
   DoublyLinkedNode();
   DoublyLinkedNode(Student theData, DoublyLinkedNode* previous,
                       DoublyLinkedNode* next);
   
   //getters and setters
   Student* getData();
   DoublyLinkedNode* getNext();
   DoublyLinkedNode* getPrevious();
   bool setData(Student theData);
   bool setNext(DoublyLinkedNode* pointer);
   bool setPrevious(DoublyLinkedNode* pointer);
   
private:
   //class data
   Student data;
   DoublyLinkedNode *next;
   DoublyLinkedNode *previous;
};

typedef DoublyLinkedNode* DoublyLinkedNodePtr;

//manages nodes by keeping track of head node of list
class DoublyLinkedList
{
public:
   //constructor
   DoublyLinkedList() : head(nullptr) {}

   //destructor
   ~DoublyLinkedList();
   
   //it doess't make sense to have a private variable head when it's address
   //is supposed to be passed to the header insert routine
   DoublyLinkedNodePtr head;
};

#endif // linkedlist_h
