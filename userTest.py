from user import Users

users = Users("localhost", "aurora", "aurora")
print users.auth("admin", "admin")