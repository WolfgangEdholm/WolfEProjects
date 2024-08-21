//  Wolfgang Edholm
//  CS2B Assignment #8 - Sorting Students

//------------------- main.cpp --------------------
#include <iostream>
#include <iomanip>
#include "LinkedList.h"

using std::cout;

//main helper functions
void headInsert(DoublyLinkedNodePtr& head, Student theData);
void deleteNode(DoublyLinkedNodePtr& head, DoublyLinkedNodePtr discard);
DoublyLinkedNodePtr findNode(DoublyLinkedNodePtr& head,
                             Student theDataToRemove);
DoublyLinkedNodePtr swap(DoublyLinkedNodePtr head, DoublyLinkedNodePtr n2);
void bubbleSort(DoublyLinkedNodePtr& head);
void display(DoublyLinkedNode* n);

// main method and logic of app
int main()
{
   //instantiate classList arrays
   string oneClassList[] = {"A1"};
   string twoClassList[] = {"B1", "B2"};
   string threeClassList[] = {"C1", "C2", "C3"};
   string fourClassList[] = {"D1", "D2", "D3", "D4"};
   string fiveClassList[] = {"E1", "E2", "E3", "E4", "E5"};
   
   //initialize student objects
   Student Student1("St 1", 1, oneClassList);
   Student Student2("St 2", 2, twoClassList);
   Student Student3("St 3", 3, threeClassList);
   Student Student4("St 4", 4, fourClassList);
   Student Student5("St 5", 5, fiveClassList);

   //create doubly linked list
   DoublyLinkedList studentList = DoublyLinkedList();

   //insert students
   headInsert(studentList.head, Student2);
   headInsert(studentList.head, Student3);
   headInsert(studentList.head, Student5);
   headInsert(studentList.head, Student4);
   headInsert(studentList.head, Student1);

   //display unsorted class nums of list
   cout << "Printing the current class numbers in the linked"
      << " list from the front:\n";
   display(studentList.head);
   
   //execute bubble sort
   cout << "Sorting from most classes to fewest classes...\n";
   bubbleSort(studentList.head);
   
   //display final list
   cout << "The final list is the following:\n";
   display(studentList.head);
   
   //find and remove node with 4 classes from list
   DoublyLinkedNodePtr fourNode = findNode(studentList.head, Student4);
   deleteNode(studentList.head, fourNode);
   
   //re-display class nums of list
   cout << "After deleting the 4 node, the list is:\n";
   display(studentList.head);

   return 0;
}

//inserts new node at the head of list
void headInsert(DoublyLinkedNode*& head, Student theData)
{
   DoublyLinkedNodePtr newHead = new DoublyLinkedNode(theData, NULL, head);
   if (head != NULL)
   {
      head->setPrevious(newHead);
   }
   head = newHead;
}

//Deletes node from list
void deleteNode(DoublyLinkedNodePtr& head,
                DoublyLinkedNodePtr discard)
{
   if (head == discard)
   {
      head = head->getNext();
      head->setPrevious(NULL);
   }
   else
   {
      DoublyLinkedNodePtr prev = discard->getPrevious();
      DoublyLinkedNodePtr next = discard->getNext();
      prev->setNext(next);
      if (next != NULL)
      {
         next->setPrevious(prev);
      }
   }
   delete discard;
}

//searches list for node
//if node is found, returns node, otherwise returns NULL
DoublyLinkedNodePtr findNode(DoublyLinkedNodePtr& head,
                             Student theDataToRemove)
{
   for (DoublyLinkedNodePtr n = head; n != NULL; n = n->getNext())
   {
      if (*n->getData() == theDataToRemove)
      {
         return n;
      }
   }
   return NULL;
}

//Sorts through linked list using bubble sort method
void bubbleSort(DoublyLinkedNodePtr& head)
{
   //count items in list
   int length = 0;
   for (DoublyLinkedNodePtr n = head; n != nullptr; n = n->getNext())
   {
      length += 1;
   }

   // outer loop: counts # comparisons in the next pass
   for (int i = length - 1;; i--)
   {
      int j = i;
      bool swapped = false;
      //the next sort pass
      for (DoublyLinkedNodePtr n = head; 0 < j--; n = n->getNext())
      {
         if (n->getData()->getNumCourses() <
             n->getNext()->getData()->getNumCourses())
         {
            if (n == head) {
               head = n->getNext();
            }
            n = swap(n, n->getNext());
            swapped = true;
         }
      }
      if (!swapped)
      {
         break;
      }
      
      //display class numbers of list after each iteration
      cout << "After iteration " << length - i << ":\n";
      display(head);
   }
}

//Swaps two nodes
//returns the node farthest ahead in the list
DoublyLinkedNodePtr swap(DoublyLinkedNodePtr ptr1, DoublyLinkedNodePtr ptr2)
{
   DoublyLinkedNodePtr next = ptr2->getNext();
   
   //update pointers
   if ((*ptr1).getPrevious() != nullptr)
   {
      ptr1->getPrevious()->setNext(ptr2);
   }
   
   if (ptr2->getNext() != nullptr)
   {
      ptr2->getNext()->setPrevious(ptr1);
   }
   
   ptr2->setPrevious(ptr1->getPrevious());
   ptr2->setNext(ptr1);
   
   ptr1->setPrevious(ptr2);
   ptr1->setNext(next);
   
   return ptr2;
}

//displays number of classes of each node in linked list
void display(DoublyLinkedNode* n)
{
   while (n != nullptr) {
      Student* student = n->getData();
      cout << student->getNumCourses() << " ";
      n = n -> getNext();
   }
   cout << "\n\n";
}

/*------------------------ Sample Run --------------------------
Printing the current class numbers in the linked list from the front:
1 4 5 3 2

Sorting from most classes to fewest classes...
After iteration 1:
4 5 3 2 1

After iteration 2:
5 4 3 2 1

The final list is the following:
5 4 3 2 1

After deleting the 4 node, the list is:
5 3 2 1

Program ended with exit code: 0
----------------------------------------------------------------*/
