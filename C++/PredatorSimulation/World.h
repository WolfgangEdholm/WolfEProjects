#ifndef World_h
#define World_h

#include <iostream>
#include <string>
#include <time.h>
#include <cstdlib>

using namespace std;

const int NONE = 0;
const int UP = 1;
const int RIGHT = 2;
const int DOWN = 3;
const int LEFT = 4;
const int ANT = 1;
const int DOODLE = 2;
const int SIDE = 4;

class World
{
public:
   //constructor
   World();
   
   //static consts
   static const int SIDE = 4;
   static const char DEFAULT_CHAR;
   
   //getter
   char* getWorld();
   
   //helper methods
   bool squareIsTaken(int row, int col);
   int antCheck(int row, int col);
   
   void displayBoard();
   void SimulateOneStep();
   void Display();

private:
   char world[SIDE][SIDE];
};

#endif /* World_h */
