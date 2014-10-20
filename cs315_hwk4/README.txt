/**********************************************************************
 *  README.txt                                                   
 *  CS315 - Dancing Cubebot
 **********************************************************************/

/**********************************************************************
* What is your name?
***********************************************************************/

Casey McGuire



/**********************************************************************
* What is the name of the dance your robot performs?
***********************************************************************/

Crazy Dance.



/**********************************************************************
* Did you complete any extensions to this assignment? If so, what?
***********************************************************************/

-Though I don't know if it counts as an extension per se, I used arcball
rotation to make my robot's body parts move.



/**********************************************************************
* Approximately how many hours did you spend working on this assignment?
***********************************************************************/

10-15.



/**********************************************************************
 * Describe any problems you encountered in this assignment.
 * What was hard, or what should we warn students about in the future?
 * How can I make this assignment better?
 **********************************************************************/

-The use of trackball rotation to make the robot's body parts move seemed really 
difficult to get to work right. I opted to use arcball rotation instead and this
seemed to work much better.

-At seemingly random times, my robot would cease to render due to the fact that my
quats would inexplicably be filled with NaN values. After some painstaking debugging,
 I found that (due to floating point approximation) the cosine of the angle between the 
two vectors would sometimes be just above 1 (like 1.000000000001) or just below -1. Thus, when 
taking the arccosine of the value, I would get NaN instead of the angle. If somebody else is
having this problem in the future, that might be why.

-It might be helpful to note that we *really* should ensure that our robot
from the previous assignment is rendered correctly (that the pivots are in the right
place, etc.). I found I had to go back and tinker with the pivots to make it look 
right.


/**********************************************************************
 * List any other comments (about the assignment or your submission) 
 * here. Feel free to provide any feedback on what you learned from 
 * doing the assignment, whether you enjoyed doing it, etc.
 **********************************************************************/



