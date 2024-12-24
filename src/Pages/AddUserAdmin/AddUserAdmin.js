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
import { coordinatorService, userService } from '../../service';
import { Edit, Delete, ExpandMore, ExpandLess } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TailSpin } from 'react-loader-spinner';

function AddUserAdmin() {
    const [formData, setFormData] = useState([]);
    const [formValues, setFormValues] = useState({
        name: '',
        userid: '',
        role: 'admin',
        phone: '',
    });
    const [formErrors, setFormErrors] = useState({
        name: '',
        userid: '',
        phone: ''
    });
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [editingIndex, setEditingIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchAllCoordinators();
    }, []);

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value) {
                    error = 'Name is required';
                } else if (value.length < 2) {
                    error = 'Name must be at least 2 characters';
                }
                break;
            case 'userid':
                if (!value) {
                    error = 'User ID is required';
                } else if (value.length < 4) {
                    error = 'User ID must be at least 4 characters';
                }
                break;
            case 'phone':
                if (!value) {
                    error = 'Phone is required';
                } else if (!/^\d{10}$/.test(value)) {
                    error = 'Phone must be 10 digits';
                }
                break;
            default:
                break;
        }
        return error;
    };

    const fetchAllCoordinators = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await userService.getAllCoordinators();
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });

        // Validate field on change
        const error = validateField(name, value);
        setFormErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const isFormValid = () => {
        const errors = {
            name: validateField('name', formValues.name),
            userid: validateField('userid', formValues.userid),
            phone: validateField('phone', formValues.phone)
        };
        setFormErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    };

    const addUserAdmin = async () => {
        if (!isFormValid()) {
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await coordinatorService.add(formValues);
            setFormData([...formData, response.data]);
            setFormValues({ name: '', userid: '', role: 'admin', phone: '' });
            toast.success('User Admin added successfully!');
        } catch (err) {
            toast.error('User Admin Already Exist ');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            return;
        }

        if (editingIndex !== null) {
            const selectedRow = filteredData[editingIndex];
            const { name, phone, role, userid } = formValues;

            // Check if the userid has changed
            if (selectedRow.userid !== userid) {
                setFormErrors(prev => ({
                    ...prev,
                    userid: 'User ID cannot be changed'
                }));
                return; // Exit if userid is changed
            }

            // Check if the data has changed
            if (selectedRow.name === name && selectedRow.phone === phone && selectedRow.role === role) {
                toast.info('No changes made to User Admin.');
                return; // Exit if no changes
            }

            setLoading(true);
            setError('');
            try {
                const payload = { name, phone, role };
                const response = await coordinatorService.update(selectedRow._id, payload);
                console.log(response)

                // Refresh the table data after updating
                await fetchAllCoordinators(); // Fetch updated data

                setFormValues({ name: '', userid: '', phone: '', role: 'admin' });
                setEditingIndex(null);
                toast.success('User Admin updated successfully!');
            } catch (err) {
                setError('Failed to update User Admin');
                toast.error('Failed to update User Admin');
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            addUserAdmin();
        }
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleEdit = (index) => {
        const selectedRow = filteredData[index];
        setFormValues({
            name: selectedRow.name,
            userid: selectedRow.userid,
            phone: selectedRow.phone,
            role: selectedRow.role,
            id: selectedRow._id
        });
        setEditingIndex(index);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        setError('');
        try {
            await coordinatorService.delete(id);
            toast.success('User Admin deleted successfully!');
            await fetchAllCoordinators();
        } catch (err) {
            setError('Failed to delete User Admin');
            toast.error('Failed to delete User Admin');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormValues({ name: '', userid: '', role: 'admin', phone: '' });
        setFormErrors({ name: '', userid: '', phone: '' });
        setEditingIndex(null);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
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
                <div className="coordinator-form">
                    <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onClick={() => setShowForm(!showForm)}
                    >
                        <h3 style={{ marginRight: '10px' }}>
                            {editingIndex !== null ? 'Edit Admin User' : 'Add Admin User'}
                        </h3>
                        {showForm ? <ExpandLess /> : <ExpandMore />}
                    </div>
                    {showForm && (
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
                                        error={!!formErrors.name}
                                        helperText={formErrors.name}
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
                                        error={!!formErrors.userid}
                                        helperText={formErrors.userid}
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
                                        error={!!formErrors.phone}
                                        helperText={formErrors.phone}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginRight: '10px' }}>
                                <Button type="button" variant="outlined" color="secondary" onClick={handleReset}>
                                    Reset
                                </Button>
                                <Button type="submit" variant="contained" color="primary">
                                    {editingIndex !== null ? 'Update Admin User' : 'Add Admin User'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>

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
