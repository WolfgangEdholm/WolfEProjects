#ifndef Administrator_h
#define Administrator_h

#include "Security.h"

class Administrator : public Security
{
public:
   //constructors
   Administrator();
   Administrator(string usernm, string pass);
   
   //getters and setters
   string getUsername();
   bool setUsername(string usernm);
   string getPassword();
   bool setPassword(string pass);
   
   //helper functions
   bool Login();
   string display();
   
private:
   //class data
   string username;
   string password;
};

#endif /* Administrator_h */
