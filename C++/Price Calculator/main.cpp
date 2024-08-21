// Wolfgang Edholm
// CS2B Assignment #10 - Price Calculator

#include <iostream>
#include <cctype>
#include "Cart.h"

using std::cin;

//global constants
const char STOP = 'S';
const int ITEM_NUM = 3;

//main helper methods
int getItem(Item items[]);
int getQuantity(Item& item);

//main method and logic of app
int main()
{
   Item c("Computer", 'C', 1000);
   Item p("Phone", 'P', 500);
   Item i("Ipad", 'I', 200);
   
   Item items[] = {c, p, i};
   
   bool shopping = true;
   int num;
   int index;
   Item item;
   
   for (int i = 0; i < ITEM_NUM; i++)
   {
      cout << i + 1 << ". " << items[i].getName() << "(" <<
      items[i].getSymbol() << ") $" << items[i].getPrice() << " each\n";
   }
   
   cout << "4. Stop Order(S)\n\n";
   
   //run until customer is done shopping
   while (shopping)
   {
      index = getItem(items);
      
      if (index == STOP)
      {
         break;
      }
      
      num = getQuantity(items[index]);
      items[index].setQuantity(item.getQuantity() + num);
   }
   
   Cart cart;
   
   for (int i = 0; i < ITEM_NUM; i++)
   {
      if (items[i].getQuantity() > MIN_NUM)
      {
         cart.addItem(items[i]);
      }
   }
   
   //display final items and cost
   cout << endl;
   cart.checkout();
   cout << endl;
}


//gets valid item and returns index of item
//returns 'S' if customer wants to stop ordering
int getItem(Item items[])
{
   bool validItem = false;
   char item;
   
   while (!validItem)
   {
      cout << "Which item would you like to buy? ";
      cin >> item;
      item = toupper(item);
      
      if (item == STOP)
      {
         return item;
      }
      
      for(int i = 0; i < ITEM_NUM; i++)
      {
         if(item == items[i].getSymbol())
         {
            return i;
         }
      }
      cout << "Not a valid item. Please try again.\n\n";
   }
   cout << endl;
   //return -1 in case of error
   return -1;
}

//gets number of an item that user wants
int getQuantity(Item& item)
{
   int num;
   bool validNum = false;
   
   while (!validNum)
   {
      cout << "How many " << item.getName() << "s would you like to buy? ";
      cin >> num;
      
      if (num >= MIN_NUM)
      {
         cout << num << " " << item.getName() << "s added to your order.\n\n";
         return num;
      }
      cout << "Not a valid number of items. Please try again.\n";
   }
   
   //error case
   return -1;
}
