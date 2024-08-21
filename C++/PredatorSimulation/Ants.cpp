#include "Ants.h"

//default constructor
Ants::Ants()
: Organism()
{ }

//3-parameter constructor
Ants::Ants(int stepNum, int currentRow, int currentColumn)
: Organism()
{ }

//
void Ants::move()
{
   randomMove();
}

//
void Ants::breed()
{
   if (getStepNum() % 3 == 0)
   {
      cout << "breeding";
   }
}

//
int Ants::getType()
{
   return ANT;
}

//
bool Ants::starve()
{
   return 0;
}
