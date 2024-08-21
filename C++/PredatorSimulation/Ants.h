#ifndef Ants_h
#define Ants_h

#include "Organism.h"

class Ants : public Organism
{
public:
   //constructors
   Ants();
   Ants(int stepNum, int currentRow, int currentColumn);
   
   //virtual methods
   virtual void move();
   virtual void breed();
   virtual int getType();
   virtual bool starve();
};

#endif /* Ants_h */
