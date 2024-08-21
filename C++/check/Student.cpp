//------------------- Student.cpp --------------------
#include "Student.h"

//static const instantiation
const string Student::DEFAULT_NAME = "no name";
const int Student::DEFAULT_CLASS_NUM = 0;
const int Student::MIN_NAME_LENGTH = 3;
const int Student::MIN_NUM_COURSES = 0;

//default constructor
Student::Student()
{
   setDefaults();
}

//main constructor
Student::Student(string name, int numCourses, string *courseList)
{
   setDefaults();
   setAll(name, numCourses, courseList);
}

//copy constrctor
Student::Student(const Student& student)
{
   name = student.name;
   numCourses = student.numCourses;
   courseList = new string[numCourses];
   for (int i = 0; i < numCourses; i++)
   {
      //make copies of class strings
      courseList[i] = student.courseList[i];
   }
}

//destructor
Student::~Student()
{
   resetAll();
}

//sets class variables to default values
void Student::setDefaults()
{
   name = DEFAULT_NAME;
   numCourses = DEFAULT_CLASS_NUM;
   courseList = NULL;
}

//sets class variables to given values
void Student::setAll(string nm, int cNum, string *cList)
{
   name = nm;
   numCourses = cNum;
   courseList = new string[numCourses];
   for (int i = 0; i < numCourses; i++)
   {
      //make copies of class strings
      courseList[i] = cList[i];
   }
}

//getter for name
string Student::getName()
{
   return name;
}

//setter for name
bool Student::setName(string nm)
{
   if (nm.length() < MIN_NAME_LENGTH)
   {
      return false;
   }
   name = nm;
   return true;
}

//getter for numCourses
int Student::getNumCourses()
{
   return numCourses;
}

//setter for numCourses
bool Student::setNumCourses(int num)
{
   if (num < MIN_NUM_COURSES)
   {
      return false;
   }
   numCourses = num;
   return true;
}

//getter for courseList
string Student::getCourseList()
{
   return *courseList;
}

//setter for courseList
bool Student::setCourseList(string *courses)
{
   //create deep copy of courses
   if (courses == NULL)
   {
      return false;
   }
   
   courseList = new string[numCourses];
   for (int i = 0; i < numCourses; i++)
   {
      //make copies of class strings
      courseList[i] = courses[i];
   }
   return true;
}

//displays student name, courseNum, and courseList
string Student::display()
{
   //string declaration
   string str;
   
   //append values to string
   str.append(name);
   str.append("\n");
   str.append(std::to_string(numCourses) + " courses");
   
   //If numCourses == 0, append "no courses"
   if (numCourses == 0)
   {
      str.append("\nNo courses\n");
   }
   //else add courses to str
   else {
      for (int i = 0; i < numCourses; i++)
      {
         str.append("\n");
         str.append(courseList[i]);
      }
      str.append("\n");
   }
   return str;
}

//sets variables to default values, clears courseList
void Student::resetAll()
{
   if (courseList != NULL)
   {
      delete[] courseList;
   }
   courseList = NULL;
   numCourses = DEFAULT_CLASS_NUM;
   name = DEFAULT_NAME;
}

//operator = overload
Student& Student::operator =(const Student& rtSide)
{
   name = rtSide.name;
   numCourses = rtSide.numCourses;
   courseList = new string[numCourses];
   for (int i = 0; i < numCourses; i++)
   {
      //make copies of class strings
      courseList[i] = rtSide.courseList[i];
   }
   
   //return object for chaining
   return *this;
}

//operator == overload
bool Student::operator ==(const Student& rtSide)
{
   if (name != rtSide.name || numCourses != rtSide.numCourses)
   {
      return false;
   }
   
   for (int i = 0; i < numCourses; i++)
   {
      if (courseList[i] != rtSide.courseList[i])
      {
         return false;
      }
   }
   
   //if all conditions met, return true;
   return true;
}
