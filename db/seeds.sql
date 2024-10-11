INSERT INTO department (name) VALUES ('Engineering'), ('HR'), ('Sales');

INSERT INTO role (title, salary, department_id) 
VALUES ('Engineer', 75000, 1), 
       ('HR Specialist', 50000, 2), 
       ('Sales Manager', 90000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES ('John', 'Doe', 1, NULL), 
       ('Jane', 'Smith', 2, NULL), 
       ('Bill', 'Johnson', 3, 1);
