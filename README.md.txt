                                                     Estrotech Robotics


This project is an [API monitoring and analytics platform] that provides detailed insights into the uptime and performance of various devices or services. The platform is built using Node.js, Express, and MongoDB Compass, and includes a set of RESTful APIs for retrieving analytical data, uptime statistics, and comprehensive reports.




## Installation

### Prerequisites
- Node.js 
- MongoDB Compass 



### Setup


- Clone the repository

- Rootdirectory -> (Machineroundbackend)

- Install dependencies: npm i bcryptjs,cors,dotenv,jsonwebtoken,mongoose,nodemon,swagger-jsdoc,swagger-ui-express

- Configure environment variables: 
   
    *) Create a `.env` file in the root directory.
    *) Add necessary environment variables ie (MONGODB_URL & JWT_SECRET).
    *) MONGODB_URL= CONNECTION STRING OF MONGODBCOMPASS_CONNECTIONSTRING/DATABASE NAME  

        Ex: { 
              
               MONGODB_URL='mongodb://localhost:27017/Internetofthings',

               MONGODBCOMPASS_CONNECTIONSTRING= mongodb://localhost:27017,

               DATABASE NAME= Internetofthings,
              
             }


- Start the development server: npx nodemon Server.js


--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------






## Usage   





When the Server started Running, the user can access the swagger documentation link - http://localhost:7700/api-docs/



### API Endpoints


- Register User  API


     Endpoint - POST http://localhost:7700/api/user/register



   
   Request Body - { "name": "Rinosh", "email": "rinosh316@gmail.com","password": "Rinosh@1995"}





- Login User API


     Endpoint - POST http://localhost:7700/api/user/login



   
   Request Body  - {"email": "rinosh316@gmail.com","password": "Rinosh@1995"}






[


- The Datasets and the scriptfile is included in the folder interviewsubmissionfiles, the zip file is also included. 

- Run the script file to make the time-series collections in your MongoDB database.

     node dataImportScript.js


- Two time series collections will be established in your database.(analyticsData,uptimeData).]








-  Analytical Data API

   Endpoint -GET http://localhost:7700/api/analytics/2024-06-20   
             
   date - 2024-06-20



-  Uptime Data API

   Endpoint - GET http://localhost:7700/api/uptime/list            


- Overall Report API
   
   Endpoint - GET http://localhost:7700/api/overall-report/list?startDate=2024-07-01&endDate=2024-07-10,

   startDate=2024-07-01,
  
   endDate=2024-07-10,

   In this case the reports between 2024-07-01 00:00 Am - 2024-07-10 00:00 is shown.
 
   The reports of the last day wont be included.ie , in this case - 2024-07-10.

   











   

