#ifndef Security_h
#define Security_h

#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

//global variables
const string EMPTY_STRING = "";
const int USER = 1;
const int ADMIN = 2;

class Security
{
public:
   //helper methods
   static int validate();
   static bool securityUpdate(int type, string username, string password);
   
private:
   //class data
   static string userUN;
   static string userPW;
   static string adminUN;
   static string adminPW;
};

#endif /* Security_h */
