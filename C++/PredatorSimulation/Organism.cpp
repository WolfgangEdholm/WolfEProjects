#include "Organism.h"

const int Organism::DEFAULT_NUM = 0;
const int Organism::MAX_NUM = 19;
const int Organism::MIN_NUM = 0;

Organism::Organism()
{
   setStepNum(DEFAULT_NUM);
   setCurrentRow(DEFAULT_NUM);
   setCurrentColumn(DEFAULT_NUM);
}

Organism::Organism(int stepNum, int currentRow, int currentColumn)
{
   setStepNum(stepNum);
   setCurrentRow(currentRow);
   setCurrentColumn(currentColumn);
}

World getWorld()
{
   return world;
}

int Organism::getStepNum()
{
   return stepNum;
}

bool Organism::setStepNum(int stepNum)
{
   this->stepNum = stepNum;
   return true;
}

int Organism::getCurrentRow()
{
   return currentRow;
}

bool Organism::setCurrentRow(int row)
{
   this->currentRow = row;
   return true;
}

int Organism::getCurrentColumn()
{
   return currentColumn;
}

bool Organism::setCurrentColumn(int column)
{
   this->currentColumn = column;
   return true;
}

bool Organism::validStepNum(int num)
{
   if (num < MIN_NUM)
   {
      return false;
   }
   return true;
}

bool Organism::validPosition(int num)
{
   if (num < MIN_NUM || num > MAX_NUM)
   {
      return false;
   }
   return true;
}

void Organism::randomMove()
{
   /* initialize random seed: */
   srand(time(NULL));
   
   int randNum = rand() % 4 + 1;
   
   cout <<  randNum << endl;
   
   World world = getWorld();
   int row = getCurrentRow();
   int col = getCurrentColumn();
   
   //move up
   if (randNum == UP)
   {
      if (world.squareIsTaken(row - 1, col))
      { }
      else
      {
         setCurrentRow(row - 1);
      }
   }
   
   //move right
   else if (randNum == RIGHT)
   {
      if (world.squareIsTaken(row, col + 1))
      { }
      else
      {
         setCurrentColumn(col + 1);
      }
   }
   
   //move down
   else if (randNum == DOWN)
   {
      if (world.squareIsTaken(row + 1, col))
      { }
      else
      {
         setCurrentRow(row + 1);
      }
   }
   
   //move left
   else
   {
      if (world.squareIsTaken(row, col - 1))
      { }
      else
      {
         setCurrentColumn(col - 1);
      }
   }
}
