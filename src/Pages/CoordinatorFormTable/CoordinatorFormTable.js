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
import './CoordinatorFormTable.css';
import Navbar from '../../Components/Navbar/Navbar';
import FooterComp from '../../Components/FooterComp/FooterComp';
import { coordinatorService, userService } from '../../service';
import { Edit, Delete } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TailSpin } from 'react-loader-spinner';

function CoordinatorFormTable() {
    const [formData, setFormData] = useState([]);
    const [formValues, setFormValues] = useState({
        name: '',
        userid: '',
        role: 'coordinator',
        phone: '',
    });
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [editingIndex, setEditingIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAllCoordinators();
    }, []);

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
            setError('Failed to fetch coordinators');
            toast.error('Failed to fetch coordinators');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const addCoordinator = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await coordinatorService.add(formValues);
            setFormData([...formData, response.data]);
            setFormValues({ name: '', userid: '', role: 'coordinator', phone: '' });
            toast.success('Coordinator added successfully!');
        } catch (err) {
            toast.error('Failed to add coordinator');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingIndex !== null) {
            setLoading(true);
            setError('');
            try {
                const { name, phone, role, id } = formValues;
                const payload = { name, phone, role };
                const response = await coordinatorService.update(id, payload);

                const updatedData = [...formData];
                updatedData[editingIndex] = response.data;
                setFormData(updatedData);

                setFormValues({ name: '', userid: '', phone: '', role: 'coordinator' });
                setEditingIndex(null);
                toast.success('Coordinator updated successfully!');
            } catch (err) {
                setError('Failed to update coordinator');
                toast.error('Failed to update coordinator');
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            addCoordinator();
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
    };

    const handleDelete = async (id) => {
        setLoading(true);
        setError('');
        try {
            await coordinatorService.delete(id);
            toast.success('Coordinator deleted successfully!');
            await fetchAllCoordinators();
        } catch (err) {
            setError('Failed to delete coordinator');
            toast.error('Failed to delete coordinator');
            console.error(err);
        } finally {
            setLoading(false);
        }
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
    const filteredData = sortedData.filter((row) => row.role === 'coordinator');

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

            <div className="title">Coordinator List</div>
            <div className="coordinator-form-table">
                <div className="coordinator-form">
                    <h3>{editingIndex !== null ? 'Edit Coordinator' : 'Add Coordinator'}</h3>
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
                            {editingIndex !== null ? 'Update Coordinator' : 'Add Coordinator'}
                        </Button>
                    </form>
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

export default CoordinatorFormTable;
