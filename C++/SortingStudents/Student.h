//------------------- Student.h --------------------
#ifndef Student_h
#define Student_h

#include <iostream>
#include <cstdlib>
#include <string>

using std::string;

//Student object
class Student
{
public:
   //constructors
   Student();
   Student(string name, int numCourses, string *courseList);
   
   //copy constructor
   Student(const Student& student);
   
   //destructor
   ~Student();
   
   //getters and setters
   string getName();
   bool setName(string name);
   int getNumCourses();
   bool setNumCourses(int num);
   string getCourseList();
   bool setCourseList(string *courses);
   
   //helper methods
   void setDefaults();
   void setAll(string nm, int cNum, string *cList);
   string display();
   void resetAll();
   
   //operator overloads
   Student& operator=(const Student& rtSide);
   bool operator==(const Student& rtSide);
   
private:
   //Student data
   string name;
   int numCourses;
   string *courseList;
   
   //static constants
   static const int DEFAULT_CLASS_NUM;
   static const int MIN_NAME_LENGTH;
   static const int MIN_NUM_COURSES;
   static const string DEFAULT_NAME;
};

#endif /* Student_h */
