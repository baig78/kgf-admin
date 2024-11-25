import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    TableSortLabel,
    TablePagination,
} from '@mui/material';
import './AddUserAdmin.css';
import Navbar from '../../Components/Navbar/Navbar';
import FooterComp from '../../Components/FooterComp/FooterComp';
import { addNewCoordinator, getAllCoordinators, deleteCoordinator, updateCoordinator } from '../../service';
import { Edit, Delete } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TailSpin } from 'react-loader-spinner'; // Loader component

function AddUserAdmin() {
    // State management
    const [formData, setFormData] = useState([]); // Stores table data
    const [formValues, setFormValues] = useState({
        name: '',
        userid: '',
        role: 'admin',
        phone: '',
    }); // Form data
    const [order, setOrder] = useState('asc'); // Sorting order
    const [orderBy, setOrderBy] = useState('name'); // Column to sort by
    const [page, setPage] = useState(0); // Current page for pagination
    const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page for pagination
    const [editingIndex, setEditingIndex] = useState(null); // Index of the row being edited
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState(''); // Error state

    // Fetch all User Admins on component mount
    useEffect(() => {
        fetchAllCoordinators();
    }, []);

    // Fetch User Admins from API
    const fetchAllCoordinators = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAllCoordinators();
            if (response && response.data) {
                setFormData(response.data);
            } else {
                setError('No data available');
                toast.error('No data available');
            }
        } catch (err) {
            setError('Failed to fetch User Admins');
            toast.error('Failed to fetch User Admins');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle input change in the form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    // Add a new User Admin
    const addUserAdmin = async () => {
        setLoading(true);
        setError('');
        try {
            const { name, userid, role, phone } = formValues;
            const response = await addNewCoordinator({ name, userid, role, phone });
            setFormData([...formData, response.data]); // Append new User Admin to the table
            setFormValues({ name: '', userid: '', role: '', phone: '' }); // Reset form
            toast.success('User Admin added successfully!');
        } catch (err) {
            toast.error('Failed to add User Admin');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingIndex !== null) {
            // Edit existing User Admin
            setLoading(true);
            setError('');
            try {
                const { name, phone, role, id } = formValues;  // Extract id from formValues
                const payload = { name, phone, role, id };  // Include id in payload
                const response = await updateCoordinator(id, payload);

                // Update the table with the edited data
                const updatedData = [...formData];
                updatedData[editingIndex] = response.data;
                setFormData(updatedData);

                setFormValues({ name: '', userid: '', phone: '', role: '' }); // Reset form
                setEditingIndex(null); // Reset editing index
                toast.success('User Admin updated successfully!');
            } catch (err) {
                setError('Failed to update User Admin');
                toast.error('Failed to update User Admin');
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            addUserAdmin(); // Add a new User Admin if no editing is in progress
        }
    };

    // Handle sorting
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Handle edit action
    const handleEdit = (index) => {
        const selectedRow = filteredData[index];
        setFormValues({
            name: selectedRow.name,
            userid: selectedRow.userid,
            phone: selectedRow.phone,
            role: selectedRow.role,
            id: selectedRow._id  // Add the ID to formValues
        });
        setEditingIndex(index);
    };

    // Handle delete action
    const handleDelete = async (id) => {
        setLoading(true);
        setError('');
        try {
            await deleteCoordinator(id); // Delete User Admin by ID
            toast.success('User Admin deleted successfully!');
            // Refresh the table data
            await fetchAllCoordinators();
        } catch (err) {
            setError('Failed to delete User Admin');
            toast.error('Failed to delete User Admin');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle pagination
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Sort and filter data
    const sortData = (data) => {
        return data.sort((a, b) => {
            if (orderBy === 'name') {
                return order === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            }
            if (orderBy === 'userid') {
                return order === 'asc'
                    ? a.userid.localeCompare(b.userid)
                    : b.userid.localeCompare(a.userid);
            }
            return 0;
        });
    };

    const sortedData = sortData(formData);
    const filteredData = sortedData.filter((row) => row.role === 'admin');

    // Adjust pagination on data changes
    useEffect(() => {
        if (page > Math.floor(filteredData.length / rowsPerPage)) {
            setPage(0);
        }
    }, [filteredData, rowsPerPage, page]);

    return (
        <>
            <Navbar />
            {loading && (
                <div className="loader-container">
                    <TailSpin height="80" width="80" color="#00ACC1" ariaLabel="loading" />
                </div>
            )}
            {error && <p className="error">{error}</p>}

            <div className="title">Admin List</div>
            <div className="coordinator-form-table">
                {/* Form Section */}
                <div className="coordinator-form">
                    <h3>{editingIndex !== null ? 'Edit Admin User' : 'Add Admin User'}</h3>
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
                                    name="userid"
                                    value={formValues.userid}
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

                        </div>
                        <Button type="submit" variant="contained" color="primary">
                            {editingIndex !== null ? 'Update Admin User' : 'Add Admin User'}
                        </Button>
                    </form>
                </div>

                {/* Table Section */}
                <div className="coordinator-table">
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
                                            active={orderBy === 'userid'}
                                            direction={orderBy === 'userid' ? order : 'asc'}
                                            onClick={() => handleRequestSort('userid')}
                                        >
                                            User ID
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Updated At</TableCell>
                                    <TableCell>Created At</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.userid}</TableCell>
                                            <TableCell>{row.phone}</TableCell>
                                            <TableCell>{row.role}</TableCell>
                                            <TableCell>{new Date(row.updatedAt).toLocaleString()}</TableCell>
                                            <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Button onClick={() => handleEdit(page * rowsPerPage + index)}>
                                                    <Edit />
                                                </Button>
                                                <Button onClick={() => handleDelete(row._id)}>
                                                    <Delete />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        rowsPerPageOptions={[5, 10, 15]}
                        count={filteredData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </div>
            </div>
            <FooterComp />
            <ToastContainer />
        </>
    );
}

export default AddUserAdmin;
