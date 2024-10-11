const inquirer = require('inquirer');
const db = require('./db');
const consoleTable = require('console.table');

const startPrompt = () => {
    inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View All Departments',
            'View All Roles',
            'View All Employees',
            'Add Department',
            'Add Role',
            'Add Employee',
            'Update Employee Role',
            'Exit'
        ]
    }).then((answers) => {
        switch (answers.action) {
            case 'View All Departments':
                viewDepartments();
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'View All Employees':
                viewEmployees();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'Exit':
                db.end();
                break;
        }
    });
};

const viewDepartments = () => {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        startPrompt();
    });
};

const viewRoles = () => {
    db.query(`
        SELECT role.id, role.title, role.salary, department.name AS department
        FROM role
        JOIN department ON role.department_id = department.id
    `, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        startPrompt();
    });
};

const viewEmployees = () => {
    db.query(`
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, manager.first_name AS manager
        FROM employee
        JOIN role ON employee.role_id = role.id
        JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON employee.manager_id = manager.id
    `, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        startPrompt();
    });
};

const addDepartment = () => {
    inquirer.prompt({
        name: 'name',
        type: 'input',
        message: 'Enter department name:'
    }).then((answer) => {
        db.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err) => {
            if (err) throw err;
            console.log(`Department ${answer.name} added!`);
            startPrompt();
        });
    });
};

const addRole = () => {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;

        const departments = res.rows.map(({ id, name }) => ({ name: name, value: id }));

        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'Enter role title:'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'Enter role salary:'
            },
            {
                name: 'department_id',
                type: 'list',
                message: 'Select department:',
                choices: departments
            }
        ]).then((answers) => {
            db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', 
                [answers.title, answers.salary, answers.department_id], (err) => {
                if (err) throw err;
                console.log(`Role ${answers.title} added!`);
                startPrompt();
            });
        });
    });
};

const addEmployee = () => {
    db.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;

        const roles = res.rows.map(({ id, title }) => ({ name: title, value: id }));

        db.query('SELECT * FROM employee', (err, res) => {
            if (err) throw err;

            const managers = res.rows.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));
            managers.push({ name: 'None', value: null });

            inquirer.prompt([
                {
                    name: 'first_name',
                    type: 'input',
                    message: 'Enter employee first name:'
                },
                {
                    name: 'last_name',
                    type: 'input',
                    message: 'Enter employee last name:'
                },
                {
                    name: 'role_id',
                    type: 'list',
                    message: 'Select role:',
                    choices: roles
                },
                {
                    name: 'manager_id',
                    type: 'list',
                    message: 'Select manager:',
                    choices: managers
                }
            ]).then((answers) => {
                db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', 
                    [answers.first_name, answers.last_name, answers.role_id, answers.manager_id], (err) => {
                    if (err) throw err;
                    console.log(`Employee ${answers.first_name} ${answers.last_name} added!`);
                    startPrompt();
                });
            });
        });
    });
};

const updateEmployeeRole = () => {
    db.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;

        const employees = res.rows.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));

        db.query('SELECT * FROM role', (err, res) => {
            if (err) throw err;

            const roles = res.rows.map(({ id, title }) => ({ name: title, value: id }));

            inquirer.prompt([
                {
                    name: 'employee_id',
                    type: 'list',
                    message: 'Select employee to update:',
                    choices: employees
                },
                {
                    name: 'role_id',
                    type: 'list',
                    message: 'Select new role:',
                    choices: roles
                }
            ]).then((answers) => {
                db.query('UPDATE employee SET role_id = $1 WHERE id = $2', 
                    [answers.role_id, answers.employee_id], (err) => {
                    if (err) throw err;
                    console.log(`Employee role updated!`);
                    startPrompt();
                });
            });
        });
    });
};

startPrompt();
