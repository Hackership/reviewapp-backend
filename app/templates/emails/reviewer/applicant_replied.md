Hello,

the applicant #{{app.id}} has replied to the questions.

----
{% for email in app.emails %}
    {% if email.anon_content %}
        {{email.anon_content}}
    {% endif %}
{% endfor %}
----


In case you don't remember, it was this application:
----

{{app.anon_content}}

-----

Please reply to this email to comment, ask questions or relay any other information to the interviewers.

Thank you very much!



--
You are receiving this email, because you have been randomly
selected to review this application.