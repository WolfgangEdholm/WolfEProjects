#include "World.h"

//const int World::SIDE = 20;
const char World::DEFAULT_CHAR = '.';

World::World()
{
   for (int row = 0; row < SIDE; row++)
   {
      for (int col = 0; col < SIDE; col++)
      {
         world[row][col] = DEFAULT_CHAR;
      }
   }
   
   for (int row = 0; row < SIDE; row+= 4)
   {
      for (int col = 0; col < SIDE; col++)
      {
         world[row][col] = 'x';
      }
   }
   
   for (int row = 2; row < SIDE; row+= 4)
   {
      world[row][10] = 'O';
   }
}

char* World::getWorld()
{
   return *world;
}

bool World::squareIsTaken(int row, int col)
{
   if (world[row][col] != DEFAULT_CHAR)
   {
      return false;
   }
   return true;
}

int World::antCheck(int row, int col)
{
   if (world[row - 1][col] == ANT)
   {
      return UP;
   }
   if (world[row][col + 1] == ANT)
   {
      return RIGHT;
   }
   if (world[row + 1][col] == ANT)
   {
      return DOWN;
   }
   if (world[row][col - 1] == ANT)
   {
      return LEFT;
   }
   return NONE;
}

void World::displayBoard()
{
   for (int row = 0; row < SIDE; row++)
   {
      for (int col = 0; col < SIDE; col++)
      {
         cout << world[row][col];
      }
      cout << row + 1 << endl;
   }
}

