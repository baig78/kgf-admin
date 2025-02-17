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
    MenuItem,
    Select,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel
} from '@mui/material';
import './CoordinatorFormTable.css';
import Navbar from '../../Components/Navbar/Navbar';
import FooterComp from '../../Components/FooterComp/FooterComp';
import { coordinatorService, userService, addressService } from '../../service';
import { Edit, Delete, ExpandMore, ExpandLess } from '@mui/icons-material';
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
        mandal: '',
        village: ''
    });
    const [formErrors, setFormErrors] = useState({
        name: '',
        userid: '',
        phone: '',
        mandal: '',
        village: ''
    });
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [editingIndex, setEditingIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [mandals, setMandals] = useState([]);
    const [selectedMandal, setSelectedMandal] = useState('');
    const [villages, setVillages] = useState([]);
    const [originalVillages, setOriginalVillages] = useState([]);
    const [selectedVillage, setSelectedVillage] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [coordinatorToDelete, setCoordinatorToDelete] = useState(null);

    useEffect(() => {
        fetchAllCoordinators();
        fetchMandals();
        fetchVillages();
    }, []);

    useEffect(() => {
        console.log('Mandals:', mandals);
        console.log('Villages:', villages);
    }, [mandals, villages]);

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
                } else if (value.length < 3) {
                    error = 'User ID must be at least 3 characters';
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

        // If the selected field is 'mandal', filter villages
        if (name === 'mandal') {
            const filteredVillages = villages.filter(village => village.mandal === value);
            setFormValues({ ...formValues, village: '' }); // Reset village selection
            setVillages(filteredVillages); // Filter villages based on selected mandal
        }

        // Validate field on change
        const error = validateField(name, value);
        setFormErrors(prev => ({ ...prev, [name]: error }));
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

    const addCoordinator = async () => {
        if (!isFormValid()) {
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await coordinatorService.add(formValues);
            setFormData([...formData, response.data]);
            setFormValues({ name: '', userid: '', role: 'coordinator', phone: '' });
            toast.success('Coordinator added successfully!');
            setShowForm(false);
        } catch (err) {
            toast.error(err.message);
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

            // Check if the User ID has changed
            if (selectedRow.userid !== userid) {
                setFormErrors(prev => ({
                    ...prev,
                    userid: 'User ID cannot be changed.' // Set error message for User ID change
                }));
                return; // Exit if User ID is changed
            }

            // Check if the data has changed
            if (selectedRow.name === name && selectedRow.phone === phone && selectedRow.role === role) {
                toast.info('No changes made to Coordinator.'); // Inform user that no changes were made
                return; // Exit if no changes
            }

            setLoading(true);
            setError('');
            try {
                const payload = { name, phone, role };
                const response = await coordinatorService.update(selectedRow._id, payload);
                setFormData(prevData => {
                    const updatedData = [...prevData];
                    updatedData[editingIndex] = response.data;
                    return updatedData;
                });

                setFormValues({ name: '', userid: '', phone: '', role: 'coordinator' });
                setEditingIndex(null);
                toast.success('Coordinator updated successfully!'); // This will only show if changes were made
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
        setShowForm(true);
    };

    const handleDeleteClick = (coordinator) => {
        setCoordinatorToDelete(coordinator);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirmed = async () => {
        try {
            const coordinatorId = coordinatorToDelete._id;
            if (!coordinatorId) {
                throw new Error('Coordinator ID not found');
            }
            await coordinatorService.delete(coordinatorId);
            toast.success(`${coordinatorToDelete.name} deleted successfully!`);
            
            // Refresh the list of coordinators
            await fetchAllCoordinators();
        } catch (error) {
            console.error('Delete Error:', error);
            toast.error('Failed to delete coordinator. Please try again.');
        } finally {
            setDeleteConfirmOpen(false);
            setCoordinatorToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setCoordinatorToDelete(null);
    };

    const handleReset = () => {
        setFormValues({ 
            name: '', 
            userid: '', 
            role: 'coordinator', 
            phone: '', 
            mandal: '', 
            village: '' 
        });
        setFormErrors({ 
            name: '', 
            userid: '', 
            phone: '',
            mandal: '',
            village: ''
        });
        setSelectedMandal('');
        setSelectedVillage('');
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
    const filteredData = sortedData.filter((row) => row.role === 'coordinator');

    useEffect(() => {
        if (page > Math.floor(filteredData.length / rowsPerPage)) {
            setPage(0);
        }
    }, [filteredData, rowsPerPage, page]);

    const fetchMandals = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await addressService.getMandals();
            console.log('Mandals Response:', response);  // Check the response
            if (response && response) {
                setMandals(response);
            } else {
                setError('No mandals available');
                toast.error('No mandals available');
            }
        } catch (err) {
            setError('Failed to fetch mandals');
            toast.error('Failed to fetch mandals');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVillages = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await addressService.getVillages();
            console.log('Villages Response:', response);  // Check the response
            if (response && response) {
                setVillages(response);
                setOriginalVillages(response);  // Store original villages
            } else {
                setError('No villages available');
                toast.error('No villages available');
            }
        } catch (err) {
            setError('Failed to fetch villages');
            toast.error('Failed to fetch villages');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMandalChange = (mandalId) => {
        // Ensure mandalId is extracted correctly whether it's an event or direct value
        const selectedMandalId = typeof mandalId === 'object' ? mandalId.target.value : mandalId;
        
        // Update form values
        setFormValues(prev => ({
            ...prev,
            mandal: selectedMandalId,
            village: '' // Reset village when mandal changes
        }));
        
        // Set selected mandal
        setSelectedMandal(selectedMandalId);
        
        // Reset selected village
        setSelectedVillage('');

        // Safely filter villages based on selected mandal
        const filteredVillages = originalVillages.filter(village => 
            village.mandal === selectedMandalId || 
            (typeof village.mandal === 'object' && village.mandal?._id === selectedMandalId)
        );
        
        // Update villages with filtered results
        setVillages(filteredVillages);
    };

    const handleVillageChange = (villageId) => {
        setSelectedVillage(villageId);
    };

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
                    <div 
                        role="button" 
                        tabIndex={0} 
                        onClick={() => setShowForm(!showForm)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                setShowForm(!showForm);
                            }
                        }}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <h3 style={{ marginRight: '10px' }}>
                            {editingIndex !== null ? 'Edit Coordinator' : 'Add Coordinator'}
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
                                <div className="form-group">
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Select Mandal</InputLabel>
                                        <Select
                                            value={selectedMandal || ''}
                                            onChange={(e) => handleMandalChange(e)}
                                            label="Select Mandal"
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            {mandals.map((mandal) => (
                                                <MenuItem key={mandal._id} value={mandal._id}>
                                                    {mandal.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className="form-group">
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Select Village</InputLabel>
                                        <Select
                                            value={selectedVillage || ''}
                                            onChange={(e) => handleVillageChange(e.target.value)}
                                            label="Select Village"
                                            renderValue={(selected) => {
                                                if (selected === '') {
                                                    return <em>None</em>;
                                                }
                                                const selectedVillage = villages.find(village => village._id === selected);
                                                return selectedVillage ? selectedVillage.name : '';
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            {villages.length === 0 ? (
                                                <MenuItem disabled>
                                                    No village available
                                                </MenuItem>
                                            ) : (
                                                villages.map((village) => (
                                                    <MenuItem key={village._id} value={village._id}>
                                                        {village.name}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>
                                </div>

                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginRight: '10px' }}>
                                <Button type="button" variant="outlined" color="secondary" onClick={handleReset}>
                                    Reset
                                </Button>
                                <Button type="submit" variant="contained" color="primary">
                                    {editingIndex !== null ? 'Update Coordinator' : 'Add Coordinator'}
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
                                            // active={orderBy === 'name'}
                                            direction={orderBy === 'name' ? order : 'asc'}
                                            onClick={() => handleRequestSort('name')}
                                        >
                                            Name
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            // active={orderBy === 'userid'}
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
                                                <Button onClick={() => handleDeleteClick(row)}>
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
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Delete Coordinator
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete coordinator {coordinatorToDelete && coordinatorToDelete.name}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirmed}  color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default CoordinatorFormTable;
