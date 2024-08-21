//  item.cpp
#include "Item.h"

const int Item::MIN_NAME_LENGTH = 2;

//2-parameter constructor
Item::Item(string name, char symbol, double price, int quant)
{
   setName(name);
   setSymbol(symbol);
   setPrice(price);
   setQuantity(quant);
}

//getter for name
string Item::getName()
{
   return name;
}

//setter for name
bool Item::setName(string nm)
{
   if (nm.length() >= MIN_NAME_LENGTH)
   {
      name = nm;
      return true;
   }
   return false;
}

//getter for symbol
char Item::getSymbol()
{
   return symbol;
}

//setter for symbol
bool Item::setSymbol(char c)
{
   symbol = c;
   return true;
}

//getter for price
double Item::getPrice()
{
   return price;
}

//setter for price
bool Item::setPrice(double price)
{
   if (price <= MIN_NUM)
   {
      return false;
   }
   this->price = price;
   return true;
}

//getter for num
int Item::getQuantity()
{
   return quantity;
}

//setter for num
bool Item::setQuantity(int quant)
{
   if (quant < MIN_NUM)
   {
      return false;
   }
   quantity = quant;
   return true;
}
