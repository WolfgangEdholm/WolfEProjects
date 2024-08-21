#include "Doodlebugs.h"

//default constructor
Doodlebugs::Doodlebugs()
: Organism()
{ }

//3-parameter constructor
Doodlebugs::Doodlebugs(int stepNum, int currentRow, int currentColumn)
: Organism()
{ }

//
void Doodlebugs::move()
{
   World world = getWorld();
   int row = getCurrentRow();
   int col = getCurrentColumn();
   
   if (world.antCheck(row, col) == UP)
   {
      setCurrentRow(row - 1);
   }
   
   else if (world.antCheck(row, col) == RIGHT)
   {
      setCurrentColumn(col + 1);
   }
   
   else if (world.antCheck(row, col) == DOWN)
   {
      setCurrentRow(row + 1);
   }
   
   else if (world.antCheck(row, col) == LEFT)
   {
      setCurrentColumn(col - 1);
   }
   
   else
   {
      randomMove();
   }
}

//
void Doodlebugs::breed()
{
   if (getStepNum() % 8 == 0)
   {
      cout << "doodle breeding";
   }
}

//
int Doodlebugs::getType()
{
   return DOODLE;
}

//
bool Doodlebugs::starve()
{
   if (getStepNum() % 3 == 0)
   {
      cout << "starving";
      return true;
   }
   return false;
}
