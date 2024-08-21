//  item.h
#ifndef item_h
#define item_h

#include <iostream>
#include <string>
#include <sstream>

using std::cout;
using std::string;
using std::ostream;
using std::endl;

//global const
const int MIN_NUM = 0;

//base class for all grocery items
class Item
{
public:
   //constructors
   Item(string name = "", char symbol = '0', double price = 0, int quant = 0);
   
   //getters and setters
   string getName();
   bool setName(string nm);
   char getSymbol();
   bool setSymbol(char c);
   double getPrice();
   bool setPrice(double price);
   int getQuantity();
   bool setQuantity(int quant);
   
private:
   //class data
   string name;
   char symbol;
   double price;
   int quantity;
   
   //static consts
   static const int MIN_NAME_LENGTH;
};

#endif /* item_h */

