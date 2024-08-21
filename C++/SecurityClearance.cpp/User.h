#ifndef User_h
#define User_h

#include "Security.h"

class User : public Security
{
public:
   //constructors
   User();
   User(string usernm, string pass);
   
   //getters and setters
   string getUsername();
   bool setUsername(string usernm);
   string getPassword();
   bool setPassword(string pass);
   
   //member functions
   bool Login();
   string display();
   
private:
   //class data
   string username;
   string password;
};

#endif /* User_h */
