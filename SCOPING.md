**1. Which findings matter most and why**

The job details page is connected to almost every given data point. Six of the seven metrics are measured on it, at it, or from it. So it has the greatest potential impact: work there touches more of the funnel than anywhere else.

Low filter usage may also indicate an opportunity to improve the discoverability and usability of the filtering experience. Only 24% of users apply a filter, yet those who do convert at three times the base rate. Search makes this worse, because it matches job titles only, so "remote", "part time" and "React" return nothing. A user who cannot search and does not notice the filters cannot narrow the list at all. And 43% of detail views come straight from Google, so many users never see the filters. 

**2. What I propose to build**

Redesign the job details page with a mobile-first approach. Mobile accounts for 61% of traffic but converts at 8%, compared with 24% on desktop, and the median user leaves after 11 seconds. The most important decision-making information should be visible above the fold: salary, location, remote or on-site status, job type, seniority, and the Apply button, with no scrolling required.

Make the filters clearer and better at guiding users to the details page, since that path converts three times better. Make them more prominent and add them to the details page, pre-filled based on the job the user landed on, so users arriving from Google can reach a filtered list with a single click.

**3. What I am not doing**

I won't change the signup wall. The data already shows that 74% of users who meet the sign up wall never come back, so a stronger free experience should lower friction and lead more people to sign up by choice.

**4. How I would know it worked**

First I would define "application": a click on Apply, or a completed submission.

I would instrument job detail views, filter usage, apply clicks, completed applications, signup interactions, bounce rate and time on page, all segmented by device and acquisition source, since Google visitors and on-site visitors behave differently. I would take a baseline before release and compare it in PostHog afterwards, checking mobile against desktop so seasonal effects do not mislead us.

I would call it a success if users reach relevant jobs more consistently, filter usage rises, the mobile conversion gap narrows, application conversion improves, and fewer users leave within seconds of landing. I would also watch whether fewer users who meet the signup wall fail to return. One effect to expect: as filter usage rises, conversion inside that group may fall, because the new users are less certain. Total applications is the number to trust.