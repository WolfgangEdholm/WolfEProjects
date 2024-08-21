#ifndef Doodlebugs_h
#define Doodlebugs_h

#include "Organism.h"

class Doodlebugs: public Organism
{
public:
   //constructors
   Doodlebugs();
   Doodlebugs(int stepNum, int currentRow, int currentColumn);
   
   //virtual methods
   virtual void move();
   virtual void breed();
   virtual int getType();
   virtual bool starve();
   
};

#endif /* Doodlebugs_h */
