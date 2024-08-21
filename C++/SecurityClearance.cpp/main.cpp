//Wolfgang Edholm
//CS2B Assignment#2

#include "Administrator.h"
#include "User.h"
#include "Security.h"

using namespace std;

int main() {
   //user declaration
   User user1;
   User user2;
   User user3;
   
   //admin declaration
   Administrator admin1;
   Administrator admin2;
   Administrator admin3;
   
   //user tests
   user1.securityUpdate(USER, "abbott", "monday");
   cout << user1.display() << endl;
   user2.securityUpdate(USER, "tom", "friday");
   cout << user2.display() << endl;
   user3.securityUpdate(USER, "costello", "tuesday");
   cout << user3.display() << endl;
   
   //admin tests
   admin1.securityUpdate(ADMIN, "abbott", "monday");
   cout << admin1.display() << endl;
   admin2.securityUpdate(ADMIN, "tom", "friday");
   cout << admin2.display() << endl;
   admin3.securityUpdate(USER, "costello", "tuesday");
   cout << admin3.display() << endl;
}
