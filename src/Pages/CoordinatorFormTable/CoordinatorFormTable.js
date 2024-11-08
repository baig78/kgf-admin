import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, TableSortLabel, TablePagination, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import './CoordinatorFormTable.css';
import Navbar from '../../Components/Navbar/Navbar';
import { Edit, Delete } from '@mui/icons-material';
import FooterComp from '../../Components/FooterComp/FooterComp';

function CoordinatorFormTable() {
    const [formData1, setFormData1] = useState([
        { name: 'John Doe', userID: 'JD001', password: 'password1', email: 'john@example.com', phone: '1234567890', category: '' },
        { name: 'Jane Smith', userID: 'JS002', password: 'password2', email: 'jane@example.com', phone: '0987654321', category: '' },
        { name: 'Tom Brown', userID: 'TB003', password: 'password3', email: 'tom@example.com', phone: '1112223333', category: '' },
        { name: 'Alice Green', userID: 'AG004', password: 'password4', email: 'alice@example.com', phone: '4445556666', category: '' },
        { name: 'Bob White', userID: 'BW005', password: 'password5', email: 'bob@example.com', phone: '7778889999', category: '' },
        { name: 'Charlie Black', userID: 'CB006', password: 'password6', email: 'charlie@example.com', phone: '0001112222', category: '' },
        { name: 'David Blue', userID: 'DB007', password: 'password7', email: 'david@example.com', phone: '3334445555', category: '' },
        { name: 'Eve Yellow', userID: 'EY008', password: 'password8', email: 'eve@example.com', phone: '6667778888', category: '' },
        { name: 'Frank Red', userID: 'FR009', password: 'password9', email: 'frank@example.com', phone: '9990001111', category: '' },
        { name: 'Grace Purple', userID: 'GP010', password: 'password10', email: 'grace@example.com', phone: '2223334444', category: '' }
    ]);

    const [formValues, setFormValues] = useState({
        name: '',
        userID: '',
        password: '',
        email: '',
        phone: '',
        category: '',
        action: ''

    });

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingIndex !== null) {
            // Update the existing row
            const updatedData = formData1.map((row, index) =>
                index === editingIndex ? formValues : row
            );
            setFormData1(updatedData);
            setEditingIndex(null);
        } else {
            // Add new row
            setFormData1([...formData1, formValues]);
        }

        setFormValues({
            name: '',
            userID: '',
            password: '',
            email: '',
            phone: '',
            category: '',
            action: ''
        });
    };


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const sortData = (data) => {
        return data.sort((a, b) => {
            if (orderBy === 'name') {
                return order === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            }
            if (orderBy === 'userID') {
                return order === 'asc'
                    ? a.userID.localeCompare(b.userID)
                    : b.userID.localeCompare(a.userID);
            }
            if (orderBy === 'email') {
                return order === 'asc'
                    ? a.email.localeCompare(b.email)
                    : b.email.localeCompare(a.email);
            }
            return 0;
        });
    };

    const sortedData = sortData(formData1);

    const [editingIndex, setEditingIndex] = useState(null);


    const handleEdit = (index) => {
        // Populate the form with the data from the selected row
        const selectedRow = formData1[index];
        setFormValues({
            name: selectedRow.name,
            userID: selectedRow.userID,
            password: selectedRow.password,  // Optional: if you want to allow editing the password
            email: selectedRow.email,
            phone: selectedRow.phone,
            category: selectedRow.category,
            action: selectedRow.action
        });

        // Optionally, you can store the index of the row being edited if you want to handle saving the edited row differently.
        setEditingIndex(index);
    };

    const handleDelete = (index) => {
        // Remove the selected row from the formData1 state
        const updatedData = formData1.filter((_, i) => i !== index);
        setFormData1(updatedData);
    };


    return (
        <>
            <Navbar />
            <div className='title'>Coordinator List</div>
            <div className="coordinator-form-table">
                <div className='coordinator-form'>
                    <h3>Add Coordinator</h3>
                    {/* Form to add data */}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group-row">
                            <div className="form-group">
                                <TextField
                                    label="Name"
                                    variant="outlined"
                                    name="name"
                                    value={formValues.name}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </div>
                            <div className="form-group">
                                <TextField
                                    label="User ID"
                                    variant="outlined"
                                    name="userID"
                                    value={formValues.userID}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </div>
                            <div className="form-group">
                                <TextField
                                    label="Password"
                                    variant="outlined"
                                    name="password"
                                    value={formValues.password}
                                    onChange={handleInputChange}
                                    type="password"
                                    fullWidth
                                    margin="normal"
                                />
                            </div>
                        </div>
                        <div className="form-group-row">
                            <div className="form-group">
                                <TextField
                                    label="Email"
                                    variant="outlined"
                                    name="email"
                                    value={formValues.email}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </div>
                            <div className="form-group">
                                <TextField
                                    label="Phone"
                                    variant="outlined"
                                    name="phone"
                                    value={formValues.phone}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </div>
                            <div className="form-group">
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Select</InputLabel>
                                    <Select
                                        name="category"
                                        value={formValues.category}
                                        onChange={handleInputChange}
                                        label="Category"
                                    >
                                        <MenuItem value="State1">State</MenuItem>
                                        <MenuItem value="State2">District</MenuItem>
                                        <MenuItem value="State3">Mandal</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            variant="contained"
                            className='add-btn'
                            color="primary"
                        >
                            {editingIndex !== null ? "Update Coordinator" : "Add Coordinator"}
                        </Button>
                    </form>
                </div>
                <div className='coordinator-table'>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'name'}
                                            direction={orderBy === 'name' ? order : 'asc'}
                                            onClick={() => handleRequestSort('name')}
                                        >
                                            Name
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'userID'}
                                            direction={orderBy === 'userID' ? order : 'asc'}
                                            onClick={() => handleRequestSort('userID')}
                                        >
                                            User ID
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell> <TableSortLabel
                                        active={orderBy === 'email'}
                                        direction={orderBy === 'email' ? order : 'asc'}
                                        onClick={() => handleRequestSort('email')}
                                    >
                                        Email
                                    </TableSortLabel></TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.userID}</TableCell>
                                        <TableCell>{row.email}</TableCell>
                                        <TableCell>{row.phone}</TableCell>
                                        <TableCell>{row.category}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleEdit(index)}>
                                                <Edit />
                                            </Button>
                                            <Button onClick={() => handleDelete(index)}>
                                                <Delete />
                                            </Button>
                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>

                <TablePagination
                    component="div"
                    count={formData1.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 20, 30]} // Define specific rows per page options
                />
            </div>

            <FooterComp />

        </>
    );
}

export default CoordinatorFormTable;
