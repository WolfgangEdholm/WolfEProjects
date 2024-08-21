//
//  Cart.cpp

#include "Cart.h"

const double Cart::TAX_RATE = .085;
const int Cart::WIDTH = 12;

Cart::Cart()
{
   setItemNum(MIN_NUM);
}

int Cart::getItemNum()
{
   return itemNum;
}

bool Cart::setItemNum(int num)
{
   if (validNum(num))
   {
      itemNum = num;
      return true;
   }
   return false;
}

Item* Cart::getCart()
{
   return cart;
}

bool Cart::validNum(int num)
{
   if (num >= MIN_NUM)
   {
      return true;
   }
   return false;
}

void Cart::addItem(Item item)
{
   itemNum += 1;
   cart[itemNum - 1] = item;
}

void Cart::checkout()
{
   string name;
   double price;
   int quantity;
   double itemTotal;
   double subtotal = 0;
   
   cout << std::left;
   cout << setw(WIDTH) << "Item" << setw(WIDTH) << "Quantity"
      << setw(WIDTH) << "Price($)" << setw(WIDTH) << "Total($)" << endl;
   
   for (int i = 0; i < itemNum; i++)
   {
      name = cart[i].getName();
      price = cart[i].getPrice();
      quantity = cart[i].getQuantity();
      itemTotal = price * quantity;
      subtotal += itemTotal;
      
      cout << setw(WIDTH) << name << setw(WIDTH) << quantity
         << setw(WIDTH) << price << setw(WIDTH) << itemTotal << endl;
   }
   
   cout << "\nSubtotal: $" << subtotal << endl;
   
   double tax = subtotal * TAX_RATE;
   
   cout << "tax: $" << tax << endl;
   
   double total = tax + subtotal;
   
   cout << "total: $" << total;
}
