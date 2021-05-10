# TableTempoServer
MVC Server (Postgres, Express, Sequelize, Node) for Table Tempo Full-Stack Project. 

<h1>Server for Table Tempo, a Restaurant Waitlist App</h1>
<p>Table Tempo is a compact web app for managing waitlists in real time, targeted towards small to medium sized restaurants who are implementing "first come, first served" seating arrangments.
The app's primary user would be restaurants and their staff, as it allows them to add parties to a running timed waitlist. The waitlist is ordered by estimated seating time given to the table,
with seated tables moved to the bottom of the list out of sight. It allows hosts to store information about incoming parties in a compact format, and use visual cues to rapidly determine
if a party has been waiting longer than expected.
</p>
<p>The app allows Admin accounts to manage other staff accounts and set permissions for those staff. The reports page allows restaurants to view previous parties by a range of dates, or search for a specific
party by name to view their visit information. An Admin can see if a party left before being seated, as well compare the estimated wait given to a table to the actual wait until they were seated.</p>
<h1>Implementation</h1>
<p>The app is developed with the Model-View-Controller design pattern. The languages/libraries used include PostgreSQL for the actual database and Nodejs as the language in tandem with Sequelize and Express.</p>
<p>The database has three tables: Restaurants, Staff, and Parties.
<p>The primary "parent" account a user will register is with the Restaurant Model. Registering a restaurant account will automatically create a staff account with the same email and password, which is
set as the Admin account at creation. Further staff can be created through a custom link with the Admin area. A uuid code is appended to the link that is specific to only that restaurant account, and ensures
that new staff accounts are linked to the correct restaurant. In terms of database associations a restaurant "has many" staff, and a staff "has many" parties.</p>
<p>"Parties" are created by staff accounts, and linked to both that specific staff and to the restaurant the staff belongs to.</p>
<h1>Security</h1>
<p>A JSON Web Token is created upon account creation, as well as on login. The Token stores encrypted login infomation, as well as the UUID for the restaurant. The UUID is used as the
primary ID for all server requests, as it's more secure than a simple incremented id number. "Admin" status is also encrypted in the Token's payload and is accessed at login to protect some
routes both on the Client side, and access to some server side requests.</p>
<h1>Future Features</h1>
<p>Version 2.0 of Table Tempo will add integration with Twillio's text messaging API. Party phone numbers are already stored in a Twilio friendly format for easy implementation of that feature.</p>
<p>On the client side, there are plans to introduce further data analysis on the Reports page, including data visualization and compiling overall wait times, estimated times, etc into easily browsable reports.</p>
<h2>Table Tempo Client Side Repo</h2>
<a href="https://github.com/gingeralford/TableTempoClient">Table Tempo Client Github</a>
<h2>Table Tempo Live Deployment on Heroku</h2>
<a href="http://table-tempo.herokuapp.com/">Table Tempo</a>
