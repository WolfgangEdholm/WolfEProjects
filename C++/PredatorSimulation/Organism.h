#ifndef Organism_h
#define Organism_h

#include "World.h"

using namespace std;

class Organism
{
public:
   //constructors
   Organism();
   Organism(int stepNum, int currentRow, int currentColumn);
   
   //getters and setters
   char* getWorld();
   int getStepNum();
   bool setStepNum(int stepNum);
   int getCurrentRow();
   bool setCurrentRow(int row);
   int getCurrentColumn();
   bool setCurrentColumn(int column);
   
   //virtual methods
   virtual void move() {}
   virtual void breed() {}
   virtual int getType() {return 1;}
   virtual bool starve() {return true;}
   
   //validator methods
   bool validStepNum(int num);
   bool validPosition(int num);
   
   //helper methods
   void randomMove();
   
private:
   //class data
   int stepNum;
   int currentRow;
   int currentColumn;
   World world;
   
   //static constants
   static const int DEFAULT_NUM;
   static const int MAX_NUM;
   static const int MIN_NUM;
};

#endif /* Organism_h */
