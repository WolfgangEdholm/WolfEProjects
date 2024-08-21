// Cart.h
#ifndef Cart_h
#define Cart_h

#include "Item.h"
#include <iomanip>

using std::setw;

//holds items of customer
class Cart
{
public:
   //constructor
   Cart();
   
   //getters and setters
   int getItemNum();
   bool setItemNum(int num);
   
   Item* getCart();
   
   //helper methods
   void addItem(Item item);
   void checkout();
   
   bool validNum(int num);
   
private:
   //class data
   int itemNum;
   Item cart[10];
   
   //static consts
   static const double TAX_RATE;
   static const int WIDTH;
};

#endif /* Cart_h */
